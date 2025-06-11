import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), checker({ typescript: true })],
    server: {
        proxy: {
            // Proxy API requests to the backend
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            // Proxy any other backend routes you might have
            '/hello': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            }
        }
    }
});
