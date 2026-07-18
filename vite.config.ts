import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl'; // ★追加

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // ★追加
  ],
  server: {
    host: true // ★ここでもホスト許可を指定可能
  }
});