import SecondaryButton from "../SecondaryButton";
import { auth as authText } from "../../content/he";
import { SidebarToggle } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({
  isMobileViewport,
  isMobileMenuOpen,
  isDesktopSidebarVisible,
  onMenuToggle,
}) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="topbar">
      <div className="topbar__start">
        <SidebarToggle
          isMobileViewport={isMobileViewport}
          isMobileMenuOpen={isMobileMenuOpen}
          isDesktopSidebarVisible={isDesktopSidebarVisible}
          onToggle={onMenuToggle}
        />
      </div>
      <div className="topbar__end">
        {user ? <span className="topbar__user">{user.name}</span> : null}
        <SecondaryButton type="button" onClick={handleLogout}>
          {authText.logoutButton}
        </SecondaryButton>
      </div>
    </header>
  );
}
