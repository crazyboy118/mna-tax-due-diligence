import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, Modal, ErrorText, fmtMoney, fmtDate } from '../components/ui';

const STATUSES = ['Initiated', 'In Review', 'On Hold', 'Completed'];
const blank = { name: '', targetCompany: '', buyerCompany: '', dealValue: '', deadline: '', description: '', team: [] };

export default function Deals() {
  const { canEdit } = useAuth();
  const nav = useNavigate();
  const [deals, setDeals] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/deals', { params: { search: search || undefined, status: status || undefined } })
        .then((r) => setDeals(r.data)).catch((e) => setErr(errMsg(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [search, status]);

  const openForm = () => { setOpen(true); api.get('/auth/users').then((r) => setUsers(r.data)); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const create = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const r = await api.post('/deals', { ...f, dealValue: Number(f.dealValue) || 0, deadline: f.deadline || undefined });
      nav(`/deals/${r.data._id}`);
    } catch (ex) { setErr(errMsg(ex)); }
  };

  return (
    <>
      <div className="row-between">
        <h2 className="page-title">Deals</h2>
        {canEdit && <button className="btn primary" onClick={openForm}>New deal</button>}
      </div>
      <div className="toolbar">
        <input placeholder="Search deals" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <ErrorText msg={!open && err} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Deal</th><th>Target</th><th>Buyer</th><th>Value</th><th>Deadline</th><th>Status</th></tr></thead>
          <tbody>
            {deals?.map((d) => (
              <tr key={d._id}>
                <td><Link to={`/deals/${d._id}`}>{d.name}</Link></td>
                <td>{d.targetCompany}</td><td>{d.buyerCompany}</td>
                <td>{fmtMoney(d.dealValue)}</td><td>{fmtDate(d.deadline)}</td>
                <td><Badge value={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {deals && deals.length === 0 && <p className="muted pad">No deals found.{canEdit && ' Use New deal to add one.'}</p>}
        {!deals && <p className="muted pad">Loading deals…</p>}
      </div>

      {open && (
        <Modal title="New deal" onClose={() => { setOpen(false); setErr(''); }}>
          <form className="form" onSubmit={create}>
            <label>Deal name<input value={f.name} onChange={set('name')} required /></label>
            <div className="two">
              <label>Target company<input value={f.targetCompany} onChange={set('targetCompany')} required /></label>
              <label>Buyer company<input value={f.buyerCompany} onChange={set('buyerCompany')} required /></label>
            </div>
            <div className="two">
              <label>Deal value (₹)<input type="number" min="0" value={f.dealValue} onChange={set('dealValue')} /></label>
              <label>Deadline<input type="date" value={f.deadline} onChange={set('deadline')} /></label>
            </div>
            <label>Team members (hold Ctrl or Cmd to select several)
              <select multiple value={f.team} onChange={(e) => setF({ ...f, team: [...e.target.selectedOptions].map((o) => o.value) })}>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </label>
            <label>Description<textarea rows="3" value={f.description} onChange={set('description')} /></label>
            <ErrorText msg={err} />
            <button className="btn primary">Create deal</button>
          </form>
        </Modal>
      )}
    </>
  );
}
