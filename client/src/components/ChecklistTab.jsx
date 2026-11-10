import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { ErrorText } from './ui';

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Not Applicable'];

export default function ChecklistTab({ dealId, canEdit }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [nt, setNt] = useState({ title: '', category: '' });
  const base = `/deals/${dealId}/checklist`;

  useEffect(() => { api.get(base).then((r) => setItems(r.data)).catch((e) => setErr(errMsg(e))); }, [dealId]);

  const update = async (item, patch) => {
    try {
      const r = await api.put(`${base}/${item._id}`, patch);
      setItems(items.map((i) => (i._id === item._id ? r.data : i)));
    } catch (e) { setErr(errMsg(e)); }
  };
  const add = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post(base, { title: nt.title, category: nt.category || 'General' });
      setItems([...items, r.data]); setNt({ title: '', category: '' });
    } catch (ex) { setErr(errMsg(ex)); }
  };
  const remove = async (item) => {
    try { await api.delete(`${base}/${item._id}`); setItems(items.filter((i) => i._id !== item._id)); }
    catch (ex) { setErr(errMsg(ex)); }
  };

  if (!items) return <p className="muted">Loading checklist…</p>;
  const done = items.filter((i) => i.status === 'Completed').length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const groups = items.reduce((g, i) => ((g[i.category] = g[i.category] || []).push(i), g), {});

  return (
    <section>
      <div className="card">
        <div className="row-between"><b>{done} of {items.length} items completed</b><b>{pct}%</b></div>
        <div className="bar big"><i className="fill f-low" style={{ width: `${pct}%` }} /></div>
      </div>
      <ErrorText msg={err} />
      {Object.entries(groups).map(([cat, list]) => (
        <div className="card" key={cat}>
          <h3>{cat}</h3>
          {list.map((i) => (
            <div className="check-row" key={i._id}>
              <span className={i.status === 'Completed' ? 'done' : ''}>{i.title}</span>
              <input className="remarks" placeholder="Remarks" defaultValue={i.remarks || ''}
                onBlur={(e) => e.target.value !== (i.remarks || '') && update(i, { remarks: e.target.value })} />
              <select value={i.status} onChange={(e) => update(i, { status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {canEdit && <button className="btn ghost red" onClick={() => remove(i)}>Remove</button>}
            </div>
          ))}
        </div>
      ))}
      <form className="card inline-form" onSubmit={add}>
        <input placeholder="Add a checklist item" value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} required />
        <input placeholder="Category (optional)" value={nt.category} onChange={(e) => setNt({ ...nt, category: e.target.value })} />
        <button className="btn primary">Add item</button>
      </form>
    </section>
  );
}
