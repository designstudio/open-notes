import './design-tokens.css';
import './styles/_variables.scss';
import './styles/_keyframe-animations.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadLocalData } from './local-data';
import { DatabaseCompatibilityError } from './storage/migration-runner';

// Set this before loading IndexedDB so pages always start at the top after reload.
window.history.scrollRestoration = 'manual';

const root = createRoot(document.getElementById('root')!);
async function start() {
  root.render(null);
  try {
    const data = await loadLocalData();
    root.render(<React.StrictMode><App initialData={data} /></React.StrictMode>);
  } catch (error) {
    const incompatible = error instanceof DatabaseCompatibilityError;
    root.render(<main className="empty-state" role="alert">
      <h3>{incompatible ? 'Atualize o Open Notes' : 'Não foi possível abrir seu espaço'}</h3>
      <p>{incompatible ? error.message : 'Seus dados salvos foram preservados. Verifique se o navegador permite armazenamento local e tente novamente.'}</p>
      <button className="text-button" onClick={() => void start()}>Tentar novamente</button>
    </main>);
  }
}
void start();
