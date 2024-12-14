import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";

// import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    port: 3005,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@client": path.resolve(__dirname, "./src"),
    },
  },
});
