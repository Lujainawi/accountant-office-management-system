import { NavLink } from "react-router";
import { appTitle, navItems, ui } from "../../content/he";
import logoImage from "../../assets/brand/talal-awidat-logo.png";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar__backdrop"
          aria-label={ui.closeMenu}
          onClick={onClose}
        />
      )}
      <aside
        id="app-sidebar"
        className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
        aria-label={ui.mainNavigation}
      >
        <div className="sidebar__brand">
          <img
            src={logoImage}
            alt="לוגו המשרד — Talal Awidat C.P.A"
            className="sidebar__brand-logo"
            width={48}
            height={48}
          />
          <span className="sidebar__brand-title">{appTitle}</span>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export function SidebarToggle({ isOpen, onToggle }) {
  return (
    <button
      type="button"
      className="sidebar__toggle"
      aria-expanded={isOpen}
      aria-controls="app-sidebar"
      aria-label={isOpen ? ui.closeMenu : ui.openMenu}
      onClick={onToggle}
    >
      {isOpen ? ui.closeMenu : ui.openMenu}
    </button>
  );
}
