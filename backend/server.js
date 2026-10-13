const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Serve static frontend files (CSS, JS, images, QR code SVGs)
app.use(express.static(path.join(__dirname, '../frontend')));

// Default Route: Serve homepage.html on root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/homepage.html'));
});

// Helper: Dynamically fetch active LAN IPv4 address for console display
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

// Bridge Function to interact with C++ backend
function callCppBridge(payload) {
    return new Promise((resolve, reject) => {
        const exePath = path.join(__dirname, 'api_bridge.exe');
        const child = execFile(exePath, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });

        child.stdin.write(JSON.stringify(payload) + '\n');
        child.stdin.end();
    });
}

// API Endpoints for creating orders (handles both /api/order and /api/orders)
const handleOrderCreation = async (req, res) => {
    try {
        const payload = {
            action: 'CREATE_ORDER',
            ...req.body
        };
        const result = await callCppBridge(payload);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

app.post('/api/order', handleOrderCreation);
app.post('/api/orders', handleOrderCreation);

// API Endpoint for getting table orders
app.get('/api/table-orders', async (req, res) => {
    try {
        const tableNumber = parseInt(req.query.table) || 0;
        const result = await callCppBridge({ action: 'GET_TABLE_ORDERS', tableNumber });
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'SmartCanteen server active' });
});

app.listen(PORT, HOST, () => {
    const currentIp = getLocalIp();
    console.log(`\n==================================================`);
    console.log(`SmartCanteen Server Online`);
    console.log(`Local Access  : http://localhost:${PORT}`);
    console.log(`Network Access: http://${currentIp}:${PORT}`);
    console.log(`==================================================\n`);
});