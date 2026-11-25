import { Icon } from "@/components/ui/icon";

export function LoadingState({ label = "Carregando estudantes…" }: { label?: string }) {
  return <div aria-busy="true"><p className="loading-label" role="status"><span className="spinner" />{label}</p><div className="student-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-avatar" /><div className="skeleton-line" /><div className="skeleton-line short" /><div className="skeleton-line" /></div>)}</div></div>;
}

export function EmptyState({ title, description, onReset, resetLabel = "Limpar filtros" }: { title: string; description: string; onReset?: () => void; resetLabel?: string }) {
  return <section className="page-state" role="status"><span className="state-icon"><Icon name="search" size={28} /></span><h2>{title}</h2><p>{description}</p>{onReset && <button className="button primary" onClick={onReset}>{resetLabel}</button>}</section>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <section className="page-state error-state" role="alert"><span className="state-icon"><Icon name="alert" size={28} /></span><h2>Não foi possível carregar os dados</h2><p>A consulta não foi concluída. Tente novamente para retomar o acompanhamento.</p><button className="button primary" onClick={onRetry}><Icon name="refresh" size={17} />Tentar novamente</button></section>;
}
