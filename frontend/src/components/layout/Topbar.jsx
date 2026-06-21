import { appTitle } from "../../content/he";
import { SidebarToggle } from "./Sidebar";

export default function Topbar({ isSidebarOpen, onSidebarToggle }) {
  return (
    <header className="topbar">
      <SidebarToggle isOpen={isSidebarOpen} onToggle={onSidebarToggle} />
      <h1 className="topbar__title">{appTitle}</h1>
    </header>
  );
}
