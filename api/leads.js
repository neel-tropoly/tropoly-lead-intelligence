const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2zI21p6SXo0TXoqGnh3KAQLv7mGCisDRdncIifAVks3AkmYP7oXqyQEMIhdEV3cHF/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL);
    if (!response.ok) throw new Error(`Apps Script returned ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
