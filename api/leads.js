// Fetches lead data directly from Google Sheet (CSV export) and maps all columns
// including the pipeline Status column (col Q = index 16)

const SHEET_ID = '1XbM0gVEDKXWswm0z90D7oS8GRZuvA8zRhRbf59Mi684';

const TABS = [
  { name: 'Cyber + DeepTech',    cluster: 'Cybersecurity + DeepTech' },
  { name: 'CleanTech + Energy',  cluster: 'CleanTech + Energy + Mining' },
  { name: 'Industrial + B2B',    cluster: 'Industrial + Specialty B2B' },
  { name: 'InsurTech + PropTech',cluster: 'InsurTech + PropTech' },
];

function parseCSV(text) {
  const rows = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const cols = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const leads = [];

    for (const tab of TABS) {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab.name)}`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const text = await resp.text();
      const rows = parseCSV(text).slice(2); // skip title + header rows

      for (const cols of rows) {
        const firstName = cols[3];
        const lastName  = cols[4];
        const company   = cols[1];
        if (!firstName || !company || firstName === 'First Name') continue;

        leads.push({
          cluster:        tab.cluster,
          company:        company,
          firstName:      firstName,
          lastName:       lastName,
          title:          cols[5]  || '',
          linkedinUrl:    cols[6]  || '',
          geography:      cols[7]  || '',
          signal:         cols[8]  || '',
          assignedTo:     cols[9]  || '',
          pipelineStatus: cols[16] || 'Not Started',  // Column Q
          nextStep:       cols[17] || '',
        });
      }
    }

    res.status(200).json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
