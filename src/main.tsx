import './design-tokens.css';
import './styles/_variables.scss';
import './styles/_keyframe-animations.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadLocalData } from './local-data';

// Set this before loading IndexedDB so pages always start at the top after reload.
window.history.scrollRestoration = 'manual';

const root = createRoot(document.getElementById('root')!);
async function start() {
  root.render(<main className="empty-state" role="status"><p>Abrindo seu espaço…</p></main>);
  try {
    const data = await loadLocalData();
    root.render(<React.StrictMode><App initialData={data} /></React.StrictMode>);
  } catch {
    root.render(<main className="empty-state" role="alert">
      <h3>Não foi possível abrir seu espaço</h3>
      <p>Seus dados salvos foram preservados. Verifique se o navegador permite armazenamento local e tente novamente.</p>
      <button className="text-button" onClick={() => void start()}>Tentar novamente</button>
    </main>);
  }
}
void start();
