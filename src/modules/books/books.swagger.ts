/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Gestion et catalogue de livres
 */

/**
 * @swagger
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: Catalogue public
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Recherche par titre, description ou auteur
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [publishedAt, price, title] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Liste paginée des livres publiés }
 *   post:
 *     tags: [Books]
 *     summary: Créer un livre (auteur)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price, categoryIds]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               isbn: { type: string }
 *               language: { type: string, default: fr }
 *               pageCount: { type: integer }
 *               price: { type: number }
 *               coverUrl: { type: string, format: uri }
 *               fileUrl: { type: string, format: uri }
 *               fileSize: { type: integer }
 *               fileFormat: { type: string }
 *               previewPercent: { type: integer, minimum: 5, maximum: 20 }
 *               categoryIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 minItems: 1
 *                 maxItems: 3
 *     responses:
 *       201: { description: Livre créé }
 *       403: { description: Non autorisé (pas auteur approuvé) }
 *
 * /books/search:
 *   get:
 *     tags: [Books]
 *     summary: Rechercher des livres
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Résultats de recherche }
 *
 * /books/me:
 *   get:
 *     tags: [Books]
 *     summary: Mes livres (auteur)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée de mes livres }
 *
 * /books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Détail d'un livre publié
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Détail du livre }
 *       404: { description: Livre non trouvé }
 *   put:
 *     tags: [Books]
 *     summary: Modifier un livre (auteur)
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
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               categoryIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *     responses:
 *       200: { description: Livre mis à jour }
 *   delete:
 *     tags: [Books]
 *     summary: Supprimer un livre (auteur)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Livre supprimé }
 *
 * /books/{id}/preview:
 *   get:
 *     tags: [Books]
 *     summary: Aperçu d'un livre
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Données de preview }
 *
 * /books/{id}/submit:
 *   post:
 *     tags: [Books]
 *     summary: Soumettre un livre pour review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Livre soumis }
 *
 * /books/{id}/download:
 *   get:
 *     tags: [Books]
 *     summary: Télécharger un livre acheté
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: URL de téléchargement }
 *       403: { description: Livre non acheté }
 */
