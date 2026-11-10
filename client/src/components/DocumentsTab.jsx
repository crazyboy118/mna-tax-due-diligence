import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { ErrorText, fmtDate } from './ui';

const CATEGORIES = ['Income Tax Return', 'GST Return', 'TDS', 'Audit Report', 'Tax Notice', 'Assessment Order', 'Transfer Pricing', 'Other'];

export default function DocumentsTab({ dealId, canEdit }) {
  const [docs, setDocs] = useState(null);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [taxYear, setTaxYear] = useState('');
  const [filter, setFilter] = useState('');
  const [err, setErr] = useState('');

  const load = () =>
    api.get(`/deals/${dealId}/documents`, { params: filter ? { category: filter } : {} })
      .then((r) => setDocs(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, [filter]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setErr('Choose a file to upload');
    const fd = new FormData();
    fd.append('category', category);
    fd.append('taxYear', taxYear);
    fd.append('file', file);
    try {
      await api.post(`/deals/${dealId}/documents`, fd);
      setFile(null); setTaxYear(''); setErr(''); e.target.reset(); load();
    } catch (ex) { setErr(errMsg(ex)); }
  };

  const download = async (d) => {
    try {
      const r = await api.get(`/deals/${dealId}/documents/${d._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url; a.download = d.originalName; a.click();
      URL.revokeObjectURL(url);
    } catch (ex) { setErr(errMsg(ex)); }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete ${d.originalName}?`)) return;
    try { await api.delete(`/deals/${dealId}/documents/${d._id}`); load(); } catch (ex) { setErr(errMsg(ex)); }
  };

  return (
    <section>
      {canEdit && (
        <form className="card inline-form" onSubmit={upload}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input placeholder="Tax year, e.g. FY 2022-23" value={taxYear} onChange={(e) => setTaxYear(e.target.value)} />
          <button className="btn primary">Upload document</button>
        </form>
      )}
      <ErrorText msg={err} />
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>File</th><th>Category</th><th>Tax year</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
          <tbody>
            {docs?.map((d) => (
              <tr key={d._id}>
                <td>{d.originalName}</td><td>{d.category}</td><td>{d.taxYear || '—'}</td>
                <td>{Math.max(1, Math.round(d.size / 1024))} KB</td>
                <td>{fmtDate(d.createdAt)} by {d.uploadedBy?.name}</td>
                <td className="actions">
                  <button className="btn ghost" onClick={() => download(d)}>Download</button>
                  {canEdit && <button className="btn ghost red" onClick={() => remove(d)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {docs && docs.length === 0 && <p className="muted pad">No documents yet. Upload the target's returns, notices and audit reports here.</p>}
      </div>
    </section>
  );
}
