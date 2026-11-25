"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/lab/students", label: "Estudantes", icon: "students" },
  { href: "/lab/assessments", label: "Avaliações", icon: "chart" },
  { href: "/lab/model", label: "Modelo de domínio", icon: "model" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = links.find((item) => pathname.startsWith(item.href))?.label ?? "Perfil do estudante";
  return <div className="app-shell">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <aside className="sidebar">
      <Link href="/lab/students" className="brand" aria-label="Ânima, página de estudantes"><span className="brand-mark"><Icon name="spark" size={27} /></span><span>ânima<span className="brand-sub">AVALIAÇÃO ATITUDINAL</span></span></Link>
      <div className="school"><span className="school-icon"><Icon name="book" /></span><div><strong>Escola Horizonte</strong><span>Ano letivo · 2026</span></div></div>
      <p className="nav-label">ACOMPANHAMENTO</p>
      <nav aria-label="Navegação principal">{links.map((item) => {
        const active = pathname.startsWith(item.href) || (item.href === "/lab/students" && pathname === "/lab/student");
        return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><Icon name={item.icon} />{item.label}</Link>;
      })}</nav>
      <div className="sidebar-bottom"><span className="avatar educator">EH</span><div><strong>Espaço do educador</strong></div></div>
    </aside>
    <div className="workspace"><header className="topbar"><div><span className="breadcrumb">Acompanhamento</span><span className="breadcrumb-divider">/</span><strong>{current}</strong></div></header><main id="conteudo" tabIndex={-1}>{children}</main><footer className="app-footer"><span>Ânima · Avaliação Atitudinal</span></footer></div>
  </div>;
}
