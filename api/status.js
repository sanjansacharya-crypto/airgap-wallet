const algosdk = require('algosdk');

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const status = await algodClient.status().do();
    return res.status(200).json({
      online: true,
      lastRound: status['last-round'],
      network: 'Algorand Testnet'
    });
  } catch (err) {
    return res.status(503).json({ online: false, error: err.message });
  }
};
