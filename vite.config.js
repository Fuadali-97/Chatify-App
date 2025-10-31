dimport { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  proxy: {
    target: "https://chatify-api.up.railway.app",
    changeOrigin: true,
    secure: false,
  },
});
