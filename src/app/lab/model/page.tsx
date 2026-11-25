import type { Metadata } from "next";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = { title: "Modelo de domínio" };

export default function ModelPage() {
  return <>
    <section className="page-heading"><div><h1>Modelo de domínio</h1></div></section>
    <div className="model-intro"><section className="panel"><Icon name="students" /><h2>Estudantes e avaliações</h2><p>Cada estudante pertence a uma turma e pode ter várias avaliações. As avaliações registram observações de diferentes professores.</p></section><section className="panel"><Icon name="chart" /><h2>Cinco dimensões de atitude</h2><p>Pontualidade, participação, respeito, colaboração e responsabilidade, avaliadas em uma escala inteira de 1 a 5.</p></section><section className="panel"><Icon name="model" /><h2>Entidades do sistema</h2><p>Classes, tabelas e tipos representam as mesmas cinco entidades, preservando seus campos e relações.</p></section></div>
    <figure className="model-diagram"><figcaption><div><h2>Diagrama de classes · UML</h2><p>Entidades, atributos e multiplicidades do domínio.</p></div><a className="button secondary" href="/uml.png" target="_blank" rel="noreferrer">Abrir PNG em tamanho completo</a></figcaption>{/* PNG local: mantém o diagrama original e sua resolução. */}<img src="/uml.png" alt="Diagrama UML: uma turma possui zero ou muitos estudantes; cada estudante compõe zero ou muitas avaliações; cada avaliação se associa a exatamente um professor e uma categoria. Todas as entidades apresentam identificação e timestamps." width={2858} height={2675} /></figure>
    <figure className="model-diagram"><figcaption><div><h2>Diagrama entidade-relacionamento · DER</h2><p>Tradução para PostgreSQL: chaves, tipos, restrições e índices.</p></div><a className="button secondary" href="/der.png" target="_blank" rel="noreferrer">Abrir PNG em tamanho completo</a></figcaption><img src="/der.png" alt="Diagrama relacional com tabelas classrooms, students, teachers, attitude_categories e attitude_assessments. Chaves primárias UUID, timestamps com fuso, chaves estrangeiras, restrições de status e notas, matrícula e e-mail únicos e índices de consulta." width={3749} height={2527} /></figure>
    <p className="model-note">O código SQL e as fontes editáveis dos diagramas acompanham o projeto.</p>
  </>;
}
