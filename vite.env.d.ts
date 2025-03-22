/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_COLLECTION_KEY: string;
  readonly VITE_PORT: string;
  readonly VITE_DEV_MODE: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DOCUMENT_STORAGE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}