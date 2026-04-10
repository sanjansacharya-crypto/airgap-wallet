const algosdk = require('algosdk');

// Algorand Testnet via AlgoNode (no API key needed)
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

module.exports = async (req, res) => {
  // CORS headers — allow any origin (needed for cross-device access)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

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

    console.log(`✅ Broadcast OK. TxID: ${txId}`);
    return res.status(200).json({ success: true, txId });

  } catch (err) {
    const message = err.response?.body?.message || err.message || 'Unknown Algorand error.';
    console.error(`❌ Broadcast failed: ${message}`);
    return res.status(400).json({ success: false, error: message });
  }
};
