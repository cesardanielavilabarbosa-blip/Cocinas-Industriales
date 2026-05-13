import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-title">Cocinas Industruales UIS</div>
        <div className="brand-subtitle">Sector A · Industrial</div>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}>
          <span>▦</span>
          Dashboard
        </NavLink>
        <NavLink to="/historial" className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}>
          <span>▤</span>
          Historial
        </NavLink>
        <NavLink to="/alertas" className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}>
          <span>△</span>
          Alertas
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-link muted"><span>⚒</span> Configuraciones</div>
        <div className="sidebar-link muted"><span>↪</span> Salida</div>
      </div>
    </aside>
  );
}
