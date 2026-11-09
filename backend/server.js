require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const os = require('os');
const { requireUser, requireStudent } = require('./middleware/auth');
const { readMenu } = require('./utils/menuStorage');
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) for (const net of interfaces[name] || []) if (net.family === 'IPv4' && !net.internal) return net.address;
  return '127.0.0.1';
}
function callCppBridge(payload) {
  return new Promise((resolve, reject) => {
    const exePath = path.join(__dirname, 'api_bridge.exe');
    const child = execFile(exePath, { cwd: path.join(__dirname, '..') }, (error, stdout) => {
      if (error) return reject(error);
      try { resolve(JSON.parse(stdout)); } catch (e) { reject(e); }
    });
    child.stdin.write(JSON.stringify(payload) + '\n'); child.stdin.end();
  });
}

// Friendly URLs. The HTML pages perform session/role checks before rendering protected content.
app.get('/', (req,res) => res.redirect('/login'));
app.get('/login', (req,res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/signup', (req,res) => res.sendFile(path.join(__dirname, '../frontend/signup.html')));
app.get('/dashboard', (req,res) => res.sendFile(path.join(__dirname, '../frontend/homepage.html')));
app.get('/admin-login', (req,res) => res.sendFile(path.join(__dirname, '../frontend/admin-login.html')));
app.get('/admin', (req,res) => res.sendFile(path.join(__dirname, '../frontend/admin.html')));

// Authenticated menu read: the student dashboard and admin portal use one catalogue.
app.get('/api/menu', requireUser, (req,res) => {
  // TXT is the single source of truth for the student menu.
  res.json(readMenu().sort((a, b) => a.name.localeCompare(b.name)));
});
app.get('/api/health', (req,res) => res.json({ success: true, message: 'SmartCanteen server active' }));
app.get('/api/students/:id', requireUser, requireStudent, async (req,res) => {
  const requested = String(req.params.id || '').trim().toUpperCase();
  const ownId = String(req.auth.profile.college_id || '').trim().toUpperCase();
  if (!ownId || requested !== ownId) return res.status(403).json({ success:false, message:'You can only view your own token balance.' });
  try {
    const result = await callCppBridge({ action:'GET_STUDENT_BALANCE', studentId: ownId });
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) { res.status(500).json({ success:false, error:err.message }); }
});
const handleOrderCreation = async (req,res) => {
  try {
    if (req.auth.profile.role !== 'student') return res.status(403).json({success:false,message:'Only student accounts can place orders.'});
    const collegeId = String(req.auth.profile.college_id || '').trim().toUpperCase();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!collegeId || !items.length) return res.status(400).json({success:false,message:'A valid student account and cart are required.'});
    const currentMenu = readMenu();
    const available = new Set(currentMenu.filter(item => item.available).map(item => item.id));
    if (items.some(x => !available.has(String(x.itemId || x.menuItemId || '')))) {
      return res.status(400).json({success:false,message:'Your cart contains an unavailable or removed menu item. Refresh the menu and try again.'});
    }
    const result = await callCppBridge({ action:'CREATE_ORDER', studentId:collegeId, tableNumber:Number(req.body.tableNumber), items });
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) { res.status(500).json({success:false,error:err.message}); }
};
app.post('/api/order', requireUser, requireStudent, handleOrderCreation);
app.post('/api/orders', requireUser, requireStudent, handleOrderCreation);
app.get('/api/table-orders', requireUser, async (req,res) => {
  try { const tableNumber=parseInt(req.query.table)||0; const result=await callCppBridge({action:'GET_TABLE_ORDERS',tableNumber}); res.json(result); }
  catch(err){res.status(500).json({success:false,error:err.message});}
});
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({error:'Unexpected server error.'}); });
app.listen(PORT, HOST, () => { console.log('SmartCanteen Server Online'); console.log(`Local Access  : http://localhost:${PORT}`); console.log(`Network Access: http://${getLocalIp()}:${PORT}`); });
