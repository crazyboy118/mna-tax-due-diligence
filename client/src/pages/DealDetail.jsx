import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, ErrorText, fmtMoney, fmtDate } from '../components/ui';
import DocumentsTab from '../components/DocumentsTab';
import ChecklistTab from '../components/ChecklistTab';
import LiabilitiesTab from '../components/LiabilitiesTab';

const STATUSES = ['Initiated', 'In Review', 'On Hold', 'Completed'];
const TABS = [['documents', 'Documents'], ['checklist', 'Checklist'], ['liabilities', 'Liabilities']];

export default function DealDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, canEdit } = useAuth();
  const [deal, setDeal] = useState(null);
  const [tab, setTab] = useState('documents');
  const [err, setErr] = useState('');

  useEffect(() => { api.get(`/deals/${id}`).then((r) => setDeal(r.data)).catch((e) => setErr(errMsg(e))); }, [id]);

  const changeStatus = async (status) => {
    try { await api.put(`/deals/${id}`, { status }); setDeal({ ...deal, status }); }
    catch (e) { setErr(errMsg(e)); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this deal with all its documents, checklist and liabilities?')) return;
    try { await api.delete(`/deals/${id}`); nav('/deals'); } catch (e) { setErr(errMsg(e)); }
  };

  if (err && !deal) return <ErrorText msg={err} />;
  if (!deal) return <p className="muted">Loading deal…</p>;

  return (
    <>
      <div className="row-between">
        <div>
          <h2 className="page-title">{deal.name}</h2>
          <p className="muted">{deal.buyerCompany} acquiring {deal.targetCompany}</p>
        </div>
        <div className="actions">
          {canEdit
            ? <select value={deal.status} onChange={(e) => changeStatus(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            : <Badge value={deal.status} />}
          {user.role === 'admin' && <button className="btn danger" onClick={remove}>Delete deal</button>}
        </div>
      </div>
      <ErrorText msg={err} />
      <div className="facts card">
        <div><span>Deal value</span><b>{fmtMoney(deal.dealValue)}</b></div>
        <div><span>Deadline</span><b>{fmtDate(deal.deadline)}</b></div>
        <div><span>Created by</span><b>{deal.createdBy?.name}</b></div>
        <div><span>Team</span><b>{deal.team.length ? deal.team.map((t) => t.name).join(', ') : 'No members yet'}</b></div>
      </div>
      {deal.description && <p className="desc">{deal.description}</p>}

      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'documents' && <DocumentsTab dealId={id} canEdit={canEdit} />}
      {tab === 'checklist' && <ChecklistTab dealId={id} canEdit={canEdit} />}
      {tab === 'liabilities' && <LiabilitiesTab dealId={id} canEdit={canEdit} />}
    </>
  );
}
