const express = require('express');
const cors = require('cors');
const algosdk = require('algosdk');
const path = require('path');

const app = express();
const PORT = 3001;

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// ─── Algorand Client (Testnet via AlgoNode) ────────────────────────────────
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

// ─── POST /api/broadcast ───────────────────────────────────────────────────
app.post('/api/broadcast', async (req, res) => {
  const { signedTxnBase64 } = req.body;

  if (!signedTxnBase64) {
    return res.status(400).json({ error: 'Missing signedTxnBase64 in request body.' });
  }

  try {
    // Decode Base64 → Buffer → Uint8Array
    const rawBytes = Buffer.from(signedTxnBase64, 'base64');
    const decodedTxn = new Uint8Array(rawBytes);

    // Broadcast to Testnet
    const { txId } = await algodClient.sendRawTransaction(decodedTxn).do();

    console.log(`✅ Transaction broadcast successful. TxID: ${txId}`);
    res.json({ success: true, txId });

  } catch (err) {
    console.error(`❌ Broadcast failed: ${err.message}`);

    // Surface the Algorand error message cleanly to the frontend
    const message = err.response?.body?.message || err.message || 'Unknown error from Algorand node.';
    res.status(400).json({ success: false, error: message });
  }
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  try {
    const status = await algodClient.status().do();
    res.json({ online: true, lastRound: status['last-round'] });
  } catch (err) {
    res.status(503).json({ online: false, error: err.message });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🛡️  AirGap Wallet Relay Server');
  console.log(`  ──────────────────────────────`);
  console.log(`  🌐  Frontend → http://localhost:${PORT}`);
  console.log(`  📡  API      → http://localhost:${PORT}/api/broadcast`);
  console.log(`  🔗  Network  → Algorand Testnet (AlgoNode)`);
  console.log('');
});
