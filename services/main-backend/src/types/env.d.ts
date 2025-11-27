declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_HOST: string;
      DATABASE_PORT: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;

      // Redis
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_PASSWORD?: string;

      // Google OAuth
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CALLBACK_URL: string;

      // JWT
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;

      // Gmail
      GMAIL_CLIENT_ID: string;
      GMAIL_CLIENT_SECRET: string;
      GMAIL_REFRESH_TOKEN: string;

      // Cloudinary
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;

      // AI Service
      AI_CONTENT_SERVICE_URL: string;

      // Server
      PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
