import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

export default function AppLayout() {
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia(MOBILE_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    function handleViewportChange() {
      const mobile = mediaQuery.matches;
      setIsMobileViewport(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    }

    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  function handleMenuToggle() {
    if (isMobileViewport) {
      setIsMobileMenuOpen((open) => !open);
      return;
    }

    setIsDesktopSidebarVisible((visible) => !visible);
  }

  return (
    <div
      className={`app-shell${
        !isDesktopSidebarVisible ? " app-shell--sidebar-hidden" : ""
      }`}
    >
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        isDesktopSidebarVisible={isDesktopSidebarVisible}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="app-shell__main">
        <Topbar
          isMobileViewport={isMobileViewport}
          isMobileMenuOpen={isMobileMenuOpen}
          isDesktopSidebarVisible={isDesktopSidebarVisible}
          onMenuToggle={handleMenuToggle}
        />
        <main className="app-shell__content" id="main-content">
          <div className="app-shell__content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
