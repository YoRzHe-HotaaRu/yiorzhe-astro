/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly YOUTUBE_API_KEY: string;
  readonly INCEPTION_API_KEY: string;
  readonly CEREBRAS_API_KEY: string;
  // More environment variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
