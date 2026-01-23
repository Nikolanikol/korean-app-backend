export const starterPacksDocs = {
  '/starter-packs': {
    get: {
      summary: 'Получить официальные Starter Packs',
      description: 'Возвращает список официальных словарей (TOPIK I, 50 most common words и т.д.)',
      tags: ['Starter Packs'],
      responses: {
        200: {
          description: 'Список официальных словарей',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Vocabulary' }
              }
            }
          }
        }
      }
    }
  }
};