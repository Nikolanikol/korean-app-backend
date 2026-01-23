export const healthDocs = {
  '/health': {
    get: {
      summary: 'Health check',
      description: 'Проверка работоспособности сервера',
      tags: ['Health'],
      responses: {
        200: {
          description: 'Сервер работает',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'ok'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};