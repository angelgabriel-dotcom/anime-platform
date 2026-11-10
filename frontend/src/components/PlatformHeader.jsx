import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon";

export default function PlatformHeader() {
  const { pathname, hash } = useLocation();
  const links = [
    { label: "Discover", to: "/", active: pathname === "/" && !hash },
    { label: "Characters", to: "/#characters", active: pathname === "/" && hash === "#characters" },
    { label: "Shadow Arena", to: "/battle", active: pathname === "/battle" },
    { label: "Rankings", to: "/leaderboard", active: pathname === "/leaderboard" },
  ];
  return (
    <header className="platform-header">
      <Link className="platform-brand" to="/" aria-label="Animverse home">
        <svg viewBox="0 0 34 38" width="29" height="33" fill="none" aria-hidden="true"><path d="M17 2 33 34H23L17 21l-6 13H1L17 2Z" fill="currentColor" /><path d="m17 12 4 8h-8l4-8Z" fill="#0c0c12" /></svg>
        <span>ANIM<span>VERSE</span><i /></span>
      </Link>
      <nav aria-label="Main navigation">{links.map(link => <Link key={link.label} to={link.to} aria-current={link.active ? "page" : undefined}>{link.label}</Link>)}</nav>
      <div className="platform-header-actions"><span className="platform-access">EARLY ACCESS</span><Link className="platform-arena-link" to="/battle"><Icon name="swords" size={17} /><span>Enter arena</span></Link></div>
    </header>
  );
}
