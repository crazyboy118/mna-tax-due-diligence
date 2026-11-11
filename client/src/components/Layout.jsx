import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ROLE_LABEL } from './ui';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Tax Diligence<small>M&amp;A deal room</small></div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/deals">Deals</NavLink>
        </nav>
        <div className="me">
          <b>{user.name}</b>
          <span>{ROLE_LABEL[user.role]}</span>
          <button onClick={() => { logout(); nav('/login'); }}>Sign out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
