// src/env.d.ts
interface ImportMetaEnv {
  readonly YOUTUBE_API_KEY: string;
  // More environment variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}