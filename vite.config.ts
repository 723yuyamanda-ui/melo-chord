import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// すべての設定を1つの defineConfig の中にまとめます
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // スマホ実機でのマイク/音響使用のためのSSL対応
  ],
  server: {
    host: true // ローカルネットワーク内での実機確認用
  },
  build: {
    // Tone.jsなどの大きなライブラリによる警告を回避
    chunkSizeWarningLimit: 1600 
  }
});