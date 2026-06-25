import { NavLink } from "react-router";
import { appTitle, navItems, ui } from "../../content/he";
import logoImage from "../../assets/brand/talal-awidat-logo.png";

export default function Sidebar({
  isMobileMenuOpen,
  isDesktopSidebarVisible,
  onMobileClose,
}) {
  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          className="sidebar__backdrop"
          aria-label={ui.closeMenu}
          onClick={onMobileClose}
        />
      )}
      <aside
        id="app-sidebar"
        className={`sidebar${isMobileMenuOpen ? " sidebar--open" : ""}${
          !isDesktopSidebarVisible ? " sidebar--desktop-hidden" : ""
        }`}
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
              onClick={onMobileClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export function SidebarToggle({
  isMobileViewport,
  isMobileMenuOpen,
  isDesktopSidebarVisible,
  onToggle,
}) {
  const isExpanded = isMobileViewport
    ? isMobileMenuOpen
    : isDesktopSidebarVisible;

  const label = isMobileViewport
    ? isMobileMenuOpen
      ? ui.closeMenu
      : ui.openMenu
    : isDesktopSidebarVisible
      ? ui.hideMenu
      : ui.openMenu;

  return (
    <button
      type="button"
      className="sidebar__toggle"
      aria-expanded={isExpanded}
      aria-controls="app-sidebar"
      aria-label={label}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
