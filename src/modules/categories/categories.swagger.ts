/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Catégories de livres
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Liste des catégories
 *     responses:
 *       200: { description: Liste des catégories avec sous-catégories }
 *
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Détail d'une catégorie
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Catégorie avec sous-catégories }
 *       404: { description: Catégorie non trouvée }
 *
 * /categories/{id}/books:
 *   get:
 *     tags: [Categories]
 *     summary: Livres d'une catégorie
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des livres }
 *       404: { description: Catégorie non trouvée }
 */
