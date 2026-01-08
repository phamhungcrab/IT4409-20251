/// <reference types="vite/client" />

// This file tells TypeScript about Vite's import.meta.env
// See: https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add more VITE_ env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
