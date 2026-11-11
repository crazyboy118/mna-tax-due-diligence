import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import './landing.css';

const ROLES = ['Buyer / Acquirer', 'Tax advisor', 'Law firm', 'PE / VC fund', 'Other'];
const VOLUMES = ['1-2 deals a year', '3-10 deals a year', '10+ deals a year'];
const AREAS = ['Income Tax', 'GST', 'TDS', 'Transfer Pricing', 'Other'];
const STEPS = [
  ['Tell us about your team', 'Share your company, your role in deals and the tax areas you review most.'],
  ['We set up your deal room', 'You get accounts with roles for admins, lead analysts and reviewers.'],
  ['Run your first diligence', 'Upload filings, work the checklist and log every liability with its amount.'],
];
const FEATURES = [
  ['Document room', 'Returns, notices and audit reports in one place, tagged by category and tax year.'],
  ['Standard checklist', 'A 15-point tax checklist on every deal, with status and remarks per item.'],
  ['Liability register', 'Each issue logged with tax type, year, amount and severity.'],
  ['Live dashboard', 'Open exposure, risk by severity and deadlines, updated as your team works.'],
];
const blank = { company: '', contactName: '', email: '', phone: '', role: ROLES[0], dealVolume: VOLUMES[0], taxAreas: [], message: '', website: '' };

export default function Landing() {
  const { user } = useAuth();
  const [f, setF] = useState(blank);
  const [state, setState] = useState('idle'); // idle | sending | done
  const [err, setErr] = useState('');

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (a) => setF({ ...f, taxAreas: f.taxAreas.includes(a) ? f.taxAreas.filter((x) => x !== a) : [...f.taxAreas, a] });
  const submit = async (e) => {
    e.preventDefault(); setState('sending'); setErr('');
    try { await api.post('/onboarding', f); setState('done'); setF(blank); }
    catch (ex) { setErr(errMsg(ex)); setState('idle'); }
  };

  return (
    <div className="lp">
      <header className="lp-nav">
        <b className="lp-brand">Tax Diligence</b>
        <nav>
          <a href="#how">How it works</a>
          <a href="#onboard">Onboarding</a>
          {user ? <Link className="lp-btn" to="/dashboard">Open dashboard</Link> : <Link className="lp-btn ghost" to="/login">Sign in</Link>}
        </nav>
      </header>

      <section className="lp-hero">
        <div>
          <p className="lp-eyebrow">M&amp;A tax due diligence</p>
          <h1>Know every tax liability before you sign the deal.</h1>
          <p className="lp-sub">One deal room where your team collects the target's tax filings, works a standard checklist and tracks each liability with its amount and severity.</p>
          <div className="lp-cta">
            <a className="lp-btn" href="#onboard">Start onboarding</a>
            <Link className="lp-btn ghost light" to="/login">Sign in</Link>
          </div>
        </div>
        <div className="lp-card" aria-hidden="true">
          <span>Open tax exposure</span>
          <strong>₹11,02,000</strong>
          <div className="lp-row"><i>High</i><div><u style={{ width: '100%' }} className="hi" /></div><em>2</em></div>
          <div className="lp-row"><i>Medium</i><div><u style={{ width: '35%' }} className="md" /></div><em>1</em></div>
          <div className="lp-row"><i>Checklist</i><div><u style={{ width: '40%' }} className="ok" /></div><em>40%</em></div>
        </div>
      </section>

      <section id="how" className="lp-sec">
        <h2>How onboarding works</h2>
        <ol className="lp-steps">
          {STEPS.map(([t, d], i) => <li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      <section className="lp-sec alt">
        <h2>Everything a diligence team needs</h2>
        <div className="lp-grid">
          {FEATURES.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      <section id="onboard" className="lp-sec">
        <h2>Request onboarding</h2>
        <p className="lp-lead">Tell us about your team and we will set up your deal room.</p>
        {state === 'done' ? (
          <div className="lp-done" role="status"><h3>Thank you, we have your request.</h3><p>Our team will contact you at the email you shared.</p><button className="lp-btn" onClick={() => setState('idle')}>Submit another</button></div>
        ) : (
          <form className="lp-form" onSubmit={submit}>
            <div className="two">
              <label>Company<input value={f.company} onChange={set('company')} required maxLength={120} /></label>
              <label>Your name<input value={f.contactName} onChange={set('contactName')} required maxLength={80} /></label>
            </div>
            <div className="two">
              <label>Work email<input type="email" value={f.email} onChange={set('email')} required /></label>
              <label>Phone (optional)<input value={f.phone} onChange={set('phone')} maxLength={30} /></label>
            </div>
            <div className="two">
              <label>You are a<select value={f.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
              <label>Deal volume<select value={f.dealVolume} onChange={set('dealVolume')}>{VOLUMES.map((v) => <option key={v}>{v}</option>)}</select></label>
            </div>
            <fieldset><legend>Tax areas you review</legend>
              {AREAS.map((a) => <label key={a} className="chk"><input type="checkbox" checked={f.taxAreas.includes(a)} onChange={() => toggle(a)} />{a}</label>)}
            </fieldset>
            <label>Anything else we should know<textarea rows="3" value={f.message} onChange={set('message')} maxLength={1000} /></label>
            <input className="lp-hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} />
            {err && <p className="error" role="alert">{err}</p>}
            <button className="lp-btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Request onboarding'}</button>
          </form>
        )}
      </section>

      <footer className="lp-foot">Tax Diligence · M&amp;A deal room</footer>
    </div>
  );
}
