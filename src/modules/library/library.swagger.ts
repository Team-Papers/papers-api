/**
 * @swagger
 * tags:
 *   name: Library
 *   description: Bibliothèque personnelle et marque-pages
 */

/**
 * @swagger
 * /library:
 *   get:
 *     tags: [Library]
 *     summary: Ma bibliothèque
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des livres en bibliothèque }
 *
 * /library/{bookId}:
 *   get:
 *     tags: [Library]
 *     summary: Détail d'un livre dans ma bibliothèque
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Détail avec progression }
 *       403: { description: Livre non possédé }
 *
 * /library/{bookId}/progress:
 *   put:
 *     tags: [Library]
 *     summary: Sauvegarder la progression de lecture
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [progress, currentPage]
 *             properties:
 *               progress: { type: number, minimum: 0, maximum: 100 }
 *               currentPage: { type: integer, minimum: 0 }
 *     responses:
 *       200: { description: Progression mise à jour }
 *
 * /library/{bookId}/bookmarks:
 *   get:
 *     tags: [Library]
 *     summary: Mes marque-pages pour un livre
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Liste des marque-pages }
 *   post:
 *     tags: [Library]
 *     summary: Ajouter un marque-page
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [page]
 *             properties:
 *               page: { type: integer, minimum: 1 }
 *               note: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Marque-page créé }
 *
 * /library/{bookId}/bookmarks/{id}:
 *   delete:
 *     tags: [Library]
 *     summary: Supprimer un marque-page
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Marque-page supprimé }
 */
