/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dirección del backend cuando el frontend se despliega separado. Vacía en desarrollo: el proxy de Vite reenvía /api. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
