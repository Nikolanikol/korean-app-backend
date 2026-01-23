import swaggerJsdoc from 'swagger-jsdoc';
import { schemas } from '../docs/schemas.js';
import { healthDocs } from '../docs/health.docs.js';
import { authDocs } from '../docs/auth.docs.js';
import { usersDocs } from '../docs/users.docs.js';
import { vocabulariesDocs } from '../docs/vocabularies.docs.js';
import { wordsDocs } from '../docs/words.docs.js';
import { studyDocs } from '../docs/study.docs.js';
import { collectionsDocs } from '../docs/collections.docs.js';
import { publicLibraryDocs } from '../docs/publicLibrary.docs.js';
import { statsDocs } from '../docs/stats.docs.js';
import { exercisesDocs } from '../docs/exercises.docs.js';
import { starterPacksDocs } from '../docs/starterPacks.docs.js';


const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Korean Learning App API',
      version: '1.0.0',
      description: 'REST API для мобильного приложения изучения корейского языка',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {
      ...healthDocs,
      ...authDocs,
      ...usersDocs,
      ...vocabulariesDocs,
      ...wordsDocs,
      ...studyDocs,
      ...collectionsDocs,
      ...publicLibraryDocs,
      ...statsDocs,
      ...exercisesDocs,
      ...starterPacksDocs
    },
    components: {
      schemas: schemas,
        securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
    },
  },
  apis: [], // больше не нужно сканировать файлы роутов
};

export const swaggerSpec = swaggerJsdoc(options);