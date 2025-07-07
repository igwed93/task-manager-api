declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    DATABASE_URL: string;
    PORT?: string;
    NEXT_PUBLIC_API_URL: string;
    CLIENT_URL: string;
  }
}
