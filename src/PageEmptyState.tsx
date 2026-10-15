import type { ReactNode } from 'react';
import './page-empty-state.css';

export function PageEmptyState({ icon, title, description, action }: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return <div className="page-empty-state">
    <span className="page-empty-state-icon" aria-hidden="true">{icon}</span>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && <button type="button" className="primary-button" onClick={action.onClick}>{action.label}</button>}
  </div>;
}
