import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { fmtMoney, fmtDate, Badge, ErrorText } from '../components/ui';

const SEV = ['High', 'Medium', 'Low'];

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/dashboard').then((r) => setS(r.data)).catch((e) => setErr(errMsg(e))); }, []);

  if (err) return <ErrorText msg={err} />;
  if (!s) return <p className="muted">Loading dashboard…</p>;

  const maxCount = Math.max(1, ...s.riskBreakdown.map((r) => r.count));
  const get = (sev) => s.riskBreakdown.find((r) => r._id === sev) || { count: 0, amount: 0 };

  return (
    <>
      <h2 className="page-title">Dashboard</h2>
      <section className="hero">
        <div>
          <span className="muted">Open tax exposure across your deals</span>
          <div className="exposure">{fmtMoney(s.totalExposure)}</div>
          <span className="muted">{s.openLiabilities} unresolved liabilities</span>
        </div>
        <div className="mini">
          <div><b>{s.totalDeals}</b><span>Deals</span></div>
          <div><b>{s.checklistProgress}%</b><span>Checklist done</span></div>
        </div>
      </section>

      <div className="grid2">
        <section className="card">
          <h3>Risk by severity</h3>
          {SEV.map((sev) => (
            <div className="bar-row" key={sev}>
              <span>{sev}</span>
              <div className="bar"><i className={`fill f-${sev.toLowerCase()}`} style={{ width: `${(get(sev).count / maxCount) * 100}%` }} /></div>
              <span className="muted">{get(sev).count} · {fmtMoney(get(sev).amount)}</span>
            </div>
          ))}
        </section>

        <section className="card">
          <h3>Deals by status</h3>
          {Object.keys(s.dealsByStatus).length === 0 && <p className="muted">No deals yet. <Link to="/deals">Create your first deal</Link>.</p>}
          {Object.entries(s.dealsByStatus).map(([k, v]) => (
            <div className="row-between" key={k}><Badge value={k} /><b>{v}</b></div>
          ))}
        </section>
      </div>

      <section className="card">
        <h3>Upcoming deadlines</h3>
        {s.upcomingDeadlines.length === 0 && <p className="muted">No upcoming deadlines.</p>}
        {s.upcomingDeadlines.map((d) => (
          <div className="row-between" key={d._id}>
            <Link to={`/deals/${d._id}`}>{d.name}<span className="muted"> · {d.targetCompany}</span></Link>
            <span>{fmtDate(d.deadline)}</span>
          </div>
        ))}
      </section>
    </>
  );
}
