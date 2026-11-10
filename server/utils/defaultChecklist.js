// Standard tax due diligence checklist, seeded into every new deal
const items = [
  ['Income Tax', 'Income tax returns filed for last 5 years'],
  ['Income Tax', 'Assessment orders and pending assessments reviewed'],
  ['Income Tax', 'Outstanding tax demands and appeals status'],
  ['Income Tax', 'Advance tax and self-assessment tax payments verified'],
  ['Income Tax', 'Carry-forward losses and MAT credit verified'],
  ['GST', 'GST returns (GSTR-1, 3B, 9) filed and reconciled'],
  ['GST', 'Input tax credit eligibility and reconciliation with GSTR-2B'],
  ['GST', 'GST notices, audits and demand orders reviewed'],
  ['TDS/TCS', 'TDS returns filed and deposits verified'],
  ['TDS/TCS', 'TDS defaults, short deduction and interest notices'],
  ['Transfer Pricing', 'Transfer pricing documentation and Form 3CEB'],
  ['Compliance', 'Tax audit report (Form 3CD) reviewed'],
  ['Compliance', 'Pending litigation and contingent tax liabilities'],
  ['Compliance', 'Tax refunds claimed and status'],
  ['Compliance', 'Indemnities and tax warranties in deal documents'],
];

module.exports = items.map(([category, title]) => ({ category, title }));
