/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Avis et notes sur les livres
 */

/**
 * @swagger
 * /reviews/books/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Avis d'un livre
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
 *       200: { description: Avis paginés avec note moyenne }
 *   post:
 *     tags: [Reviews]
 *     summary: Ajouter un avis (1 par utilisateur par livre)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, maxLength: 2000 }
 *     responses:
 *       201: { description: Avis créé }
 *       409: { description: Avis déjà existant }
 *
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Modifier mon avis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, maxLength: 2000 }
 *     responses:
 *       200: { description: Avis mis à jour }
 *   delete:
 *     tags: [Reviews]
 *     summary: Supprimer mon avis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Avis supprimé }
 */
