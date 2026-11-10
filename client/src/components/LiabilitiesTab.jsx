import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { Badge, ErrorText, fmtMoney } from './ui';

const TAX = ['Income Tax', 'GST', 'TDS', 'Transfer Pricing', 'Customs', 'Other'];
const SEV = ['Low', 'Medium', 'High'];
const STATUS = ['Open', 'Under Dispute', 'Resolved'];
const blank = { title: '', taxType: 'Income Tax', assessmentYear: '', amount: '', severity: 'Medium', description: '' };

export default function LiabilitiesTab({ dealId, canEdit }) {
  const [items, setItems] = useState(null);
  const [f, setF] = useState(blank);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const base = `/deals/${dealId}/liabilities`;

  useEffect(() => { api.get(base).then((r) => setItems(r.data)).catch((e) => setErr(errMsg(e))); }, [dealId]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post(base, { ...f, amount: Number(f.amount) });
      setItems([...items, r.data]); setF(blank); setShow(false); setErr('');
    } catch (ex) { setErr(errMsg(ex)); }
  };
  const setStatus = async (item, status) => {
    try {
      const r = await api.put(`${base}/${item._id}`, { status });
      setItems(items.map((i) => (i._id === item._id ? r.data : i)));
    } catch (ex) { setErr(errMsg(ex)); }
  };
  const remove = async (item) => {
    if (!window.confirm('Delete this liability?')) return;
    try { await api.delete(`${base}/${item._id}`); setItems(items.filter((i) => i._id !== item._id)); }
    catch (ex) { setErr(errMsg(ex)); }
  };

  if (!items) return <p className="muted">Loading liabilities…</p>;
  const open = items.filter((i) => i.status !== 'Resolved');
  const exposure = open.reduce((s, i) => s + i.amount, 0);

  return (
    <section>
      <div className="card row-between">
        <div><span className="muted">Open exposure</span><div className="exposure sm">{fmtMoney(exposure)}</div></div>
        <button className="btn primary" onClick={() => setShow(!show)}>{show ? 'Cancel' : 'Add liability'}</button>
      </div>
      {show && (
        <form className="card form" onSubmit={add}>
          <label>Issue<input value={f.title} onChange={set('title')} placeholder="e.g. Disallowed ITC for FY 2021-22" required /></label>
          <div className="two">
            <label>Tax type<select value={f.taxType} onChange={set('taxType')}>{TAX.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>Assessment year<input value={f.assessmentYear} onChange={set('assessmentYear')} placeholder="AY 2022-23" /></label>
          </div>
          <div className="two">
            <label>Amount (₹)<input type="number" min="0" value={f.amount} onChange={set('amount')} required /></label>
            <label>Severity<select value={f.severity} onChange={set('severity')}>{SEV.map((s) => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label>Details<textarea rows="2" value={f.description} onChange={set('description')} /></label>
          <button className="btn primary">Save liability</button>
        </form>
      )}
      <ErrorText msg={err} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Issue</th><th>Tax</th><th>Year</th><th>Amount</th><th>Severity</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id}>
                <td>{i.title}{i.description && <div className="muted small">{i.description}</div>}</td>
                <td>{i.taxType}</td><td>{i.assessmentYear || '—'}</td><td>{fmtMoney(i.amount)}</td>
                <td><Badge value={i.severity} /></td>
                <td><select value={i.status} onChange={(e) => setStatus(i, e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></td>
                <td>{canEdit && <button className="btn ghost red" onClick={() => remove(i)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted pad">No liabilities logged. Add each tax issue you find, with amount and severity.</p>}
      </div>
    </section>
  );
}
