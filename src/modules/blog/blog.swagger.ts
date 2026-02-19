/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Articles de blog
 */

/**
 * @swagger
 * /blog:
 *   get:
 *     tags: [Blog]
 *     summary: Liste des articles publiés
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
 *         description: Recherche par titre ou catégorie
 *     responses:
 *       200: { description: Liste paginée des articles publiés }
 *
 * /blog/slug/{slug}:
 *   get:
 *     tags: [Blog]
 *     summary: Détail d'un article par slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Détail de l'article }
 *       404: { description: Article non trouvé }
 *
 * /blog/{id}/like:
 *   post:
 *     tags: [Blog]
 *     summary: Liker/Unliker un article
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: État du like }
 *
 * /blog/admin:
 *   get:
 *     tags: [Blog]
 *     summary: Liste de tous les articles (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED, ARCHIVED] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste paginée des articles }
 *   post:
 *     tags: [Blog]
 *     summary: Créer un article (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string, maxLength: 255 }
 *               content: { type: string }
 *               excerpt: { type: string, maxLength: 500 }
 *               coverUrl: { type: string }
 *               category: { type: string }
 *               status: { type: string, enum: [DRAFT, PUBLISHED], default: DRAFT }
 *     responses:
 *       201: { description: Article créé }
 *
 * /blog/admin/{id}:
 *   get:
 *     tags: [Blog]
 *     summary: Détail d'un article (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Détail de l'article }
 *       404: { description: Article non trouvé }
 *   patch:
 *     tags: [Blog]
 *     summary: Modifier un article (admin)
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
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               excerpt: { type: string }
 *               coverUrl: { type: string }
 *               category: { type: string }
 *               status: { type: string, enum: [DRAFT, PUBLISHED, ARCHIVED] }
 *     responses:
 *       200: { description: Article modifié }
 *   delete:
 *     tags: [Blog]
 *     summary: Supprimer un article (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Article supprimé }
 */
