export const fmtMoney = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
export const ROLE_LABEL = { admin: 'Admin', lead_analyst: 'Lead analyst', reviewer: 'Reviewer' };

export function Badge({ value }) {
  return <span className={`badge b-${String(value).toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const ErrorText = ({ msg }) => (msg ? <p className="error" role="alert">{msg}</p> : null);
