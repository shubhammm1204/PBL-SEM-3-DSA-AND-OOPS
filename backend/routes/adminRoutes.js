const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAdmin } = require('../middleware/adminAuth');
const router = express.Router();
router.use(requireAdmin);
const studentsFile = path.join(__dirname, '..', 'data', 'students.txt');
const transactionsFile = path.join(__dirname, '..', 'data', 'transactions.txt');
const ordersFile = path.join(__dirname, '..', 'data', 'orders.txt');
const { readMenu, writeMenu } = require('../utils/menuStorage');


function readMembers() {
  if (!fs.existsSync(studentsFile)) return [];
  return fs.readFileSync(studentsFile, 'utf8').split(/\r?\n/).filter(Boolean).map(line => {
    const [collegeId, name, balance] = line.split('|');
    return { collegeId, name, balance: Number(balance) || 0, role: /^(FAC|faculty)/i.test(collegeId) ? 'Faculty' : 'Student' };
  });
}
function writeMembers(rows) {
  const tmp = `${studentsFile}.tmp`;
  fs.writeFileSync(tmp, rows.map(m => `${m.collegeId}|${m.name}|${m.balance}`).join('\n') + '\n', 'utf8');
  fs.renameSync(tmp, studentsFile);
}
function readTransactions() {
  if (!fs.existsSync(transactionsFile)) return [];

  return fs.readFileSync(transactionsFile, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      const [id, created_at, college_id, member_name,
        member_role, amount, note, admin_user_id] = line.split('|');

      return {
        id,
        created_at,
        college_id,
        member_name,
        member_role,
        amount: Number(amount),
        note: note || '',
        admin_user_id
      };
    })
    .reverse();
}
function readOrders() {
  if (!fs.existsSync(ordersFile)) return [];

  const members = readMembers();

  return fs.readFileSync(ordersFile, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      const [orderId, studentId, table, amount, status] = line.split('|');

      const student = members.find(
        m => m.collegeId.toUpperCase() === studentId.toUpperCase()
      );

      const name = student ? student.name : studentId;

      return {
        id: orderId,
        studentId,
        name,
        initials: name.split(/\s+/).slice(0, 2)
          .map(part => part[0]).join('').toUpperCase(),
        items: 'Item details not stored',
        table: Number(table),
        amount: Number(amount),
        status
      };
    })
    .reverse();
}
router.get('/me', (req,res) => res.json({ ...req.admin.profile, email: req.admin.user.email }));
router.get('/members/:collegeId', (req,res) => {
  const id = String(req.params.collegeId || '').trim().toUpperCase();
  const member = readMembers().find(m => m.collegeId.toUpperCase() === id);
  if (!member) return res.status(404).json({ error: 'College ID not found in the current canteen student records.' });
  res.json(member);
});
router.post('/token-recharges', (req, res, next) => {
  const collegeId = String(req.body.collegeId || '')
    .trim().toUpperCase();

  const amount = Number(req.body.amount);

  const note = String(req.body.note || '')
    .trim()
    .replace(/[|\r\n]/g, ' ')
    .slice(0, 100);

  if (
    !collegeId ||
    !Number.isSafeInteger(amount) ||
    amount < 1 ||
    amount > 100000
  ) {
    return res.status(400).json({
      error: 'Enter a valid College ID and recharge amount.'
    });
  }

  try {
    const rows = readMembers();

    const index = rows.findIndex(
      m => m.collegeId.toUpperCase() === collegeId
    );

    if (index < 0) {
      return res.status(404).json({
        error: 'College ID not found in students.txt.'
      });
    }

    const member = rows[index];
    const oldBalance = member.balance;

    member.balance += amount;

    const transaction = {
      id: `TXN${Date.now()}`,
      created_at: new Date().toISOString(),
      college_id: member.collegeId,
      member_name: member.name,
      member_role: member.role,
      amount,
      note,
      admin_user_id: req.admin.user.id
    };

    writeMembers(rows);

    try {
      fs.appendFileSync(
        transactionsFile,
        [
          transaction.id,
          transaction.created_at,
          transaction.college_id,
          transaction.member_name,
          transaction.member_role,
          transaction.amount,
          transaction.note,
          transaction.admin_user_id
        ].join('|') + '\n',
        'utf8'
      );
    } catch (error) {
      member.balance = oldBalance;
      writeMembers(rows);
      throw error;
    }

    res.json({
      success: true,
      member,
      transaction
    });

  } catch (error) {
    next(error);
  }
});
router.get('/token-recharges', (req, res) => {
  try {
    res.json(readTransactions());
  } catch (error) {
    res.status(500).json({
      error: 'Could not read recharge history.'
    });
  }
});
router.get('/menu', (req,res) => {
  res.json(readMenu().sort((a, b) => a.name.localeCompare(b.name)));
});

router.post('/menu', (req,res) => {
  const items = readMenu();
  const item = {
    id: String(req.body.id || `CB${Date.now()}`).trim(),
    name: String(req.body.name || '').trim(),
    category: String(req.body.category || '').trim(),
    price: Number(req.body.price),
    emoji: String(req.body.emoji || '🍽️').trim(),
    available: req.body.available !== false
  };
  if (!item.id || !item.name || !item.category ||
      !Number.isSafeInteger(item.price) || item.price < 1 ||
      [item.id, item.name, item.category, item.emoji].some(v => /[|\r\n]/.test(v))) {
    return res.status(400).json({ error: 'Provide a valid ID, name, category and positive whole-number price.' });
  }
  if (items.some(existing => existing.id === item.id)) {
    return res.status(409).json({ error: 'A menu item with this ID already exists.' });
  }
  items.push(item);
  try {
    writeMenu(items);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Could not save the menu file.' });
  }
});

router.patch('/menu/:id', (req,res) => {
  const items = readMenu();
  const index = items.findIndex(item => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Menu item not found.' });

  const current = items[index];
  const patch = {};
  for (const key of ['name', 'category', 'emoji']) {
    if (req.body[key] !== undefined) patch[key] = String(req.body[key]).trim();
  }
  if (req.body.price !== undefined) {
    const price = Number(req.body.price);
    if (!Number.isSafeInteger(price) || price < 1) {
      return res.status(400).json({ error: 'Price must be a positive whole number.' });
    }
    patch.price = price;
  }
  if (req.body.available !== undefined) patch.available = Boolean(req.body.available);
  if (Object.values(patch).some(value => typeof value === 'string' && /[|\r\n]/.test(value))) {
    return res.status(400).json({ error: 'Menu fields cannot contain | or line breaks.' });
  }

  items[index] = { ...current, ...patch };
  try {
    writeMenu(items);
    res.json(items[index]);
  } catch (error) {
    res.status(500).json({ error: 'Could not update the menu file.' });
  }
});

router.delete('/menu/:id', (req,res) => {
  const items = readMenu();
  const remaining = items.filter(item => item.id !== req.params.id);
  if (remaining.length === items.length) return res.status(404).json({ error: 'Menu item not found.' });
  try {
    writeMenu(remaining);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Could not update the menu file.' });
  }
});
router.delete('/menu/:id', (req,res) => {
  const items = readMenu();
  const remaining = items.filter(item => item.id !== req.params.id);

  if (remaining.length === items.length) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  try {
    writeMenu(remaining);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Could not update the menu file.' });
  }
});

// ADD THE ORDERS ROUTE HERE
router.get('/orders', (req, res) => {
  try {
    res.json({
      success: true,
      orders: readOrders()
    });
  } catch (error) {
    console.error('Order loading error:', error);

    res.status(500).json({
      success: false,
      error: 'Could not load orders.'
    });
  }
});

module.exports = router;
