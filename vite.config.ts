import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dropboxLocalAuth } from './local/dropbox-plugin.mjs';
export default defineConfig({ plugins: [react(), dropboxLocalAuth()], server: { strictPort: true }, preview: { strictPort: true }, resolve: { alias: { "@": new URL("./src", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") } } });
