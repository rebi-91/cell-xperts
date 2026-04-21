// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    // Expose env variables to your client code
    define: {
      'process.env': {
        VITE_MAILJET_API_KEY: JSON.stringify(env.VITE_MAILJET_API_KEY),
        VITE_MAILJET_SECRET_KEY: JSON.stringify(env.VITE_MAILJET_SECRET_KEY)
      }
    }
  };
});
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0', // Allows external access
//     port: 5173,       // Ensure this matches your desired port
//     // Optional: Specify the port or use default
//     // port: 3000,
//   },
// });
