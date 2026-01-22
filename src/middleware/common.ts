import cors from 'cors';
import helmet from 'helmet';
import express from 'express';

export const setupMiddleware = (app: express.Application) => {
  // Security
  app.use(helmet());
  
  // CORS
  app.use(cors());
  
  // JSON parsing
  app.use(express.json());
};