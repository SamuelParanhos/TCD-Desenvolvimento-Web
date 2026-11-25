import Link from "next/link";

export default function NotFound() {
  return <section className="page-state"><p className="eyebrow">PÁGINA NÃO ENCONTRADA</p><h1>Vamos voltar ao acompanhamento?</h1><p>O endereço solicitado não corresponde a uma página do Ânima.</p><Link className="button primary" href="/lab/students">Ver estudantes</Link></section>;
}
