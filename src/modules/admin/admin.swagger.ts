/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints d'administration (rôle ADMIN requis)
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Statistiques du tableau de bord
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: KPIs (users, authors, books, revenue, pending) }
 *
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des utilisateurs
 *     security: [{ bearerAuth: [] }]
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
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [READER, AUTHOR, ADMIN] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, SUSPENDED, BANNED] }
 *     responses:
 *       200: { description: Liste paginée }
 *
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Détail utilisateur }
 *
 * /admin/users/{id}/suspend:
 *   put:
 *     tags: [Admin]
 *     summary: Suspendre un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Utilisateur suspendu }
 *
 * /admin/users/{id}/ban:
 *   put:
 *     tags: [Admin]
 *     summary: Bannir un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Utilisateur banni }
 *
 * /admin/users/{id}/activate:
 *   put:
 *     tags: [Admin]
 *     summary: Réactiver un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Utilisateur réactivé }
 *
 * /admin/authors:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des auteurs (filtres par statut)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée }
 *
 * /admin/authors/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Approuver une demande auteur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Auteur approuvé + rôle mis à jour }
 *
 * /admin/authors/{id}/reject:
 *   put:
 *     tags: [Admin]
 *     summary: Rejeter une demande auteur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Auteur rejeté }
 *
 * /admin/books:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des livres (filtres par statut)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PENDING, APPROVED, REJECTED, PUBLISHED] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée }
 *
 * /admin/books/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Approuver et publier un livre
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Livre publié }
 *
 * /admin/books/{id}/reject:
 *   put:
 *     tags: [Admin]
 *     summary: Rejeter un livre (avec motif)
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200: { description: Livre rejeté }
 *
 * /admin/books/{id}/suspend:
 *   put:
 *     tags: [Admin]
 *     summary: Suspendre un livre
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Livre suspendu }
 *
 * /admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des catégories
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Toutes les catégories }
 *   post:
 *     tags: [Admin]
 *     summary: Créer une catégorie
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               parentId: { type: string, format: uuid }
 *               icon: { type: string }
 *               orderIndex: { type: integer }
 *     responses:
 *       201: { description: Catégorie créée }
 *
 * /admin/categories/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Modifier une catégorie
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
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               parentId: { type: string, format: uuid, nullable: true }
 *               icon: { type: string }
 *               orderIndex: { type: integer }
 *     responses:
 *       200: { description: Catégorie mise à jour }
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer une catégorie
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Catégorie supprimée }
 *
 * /admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: Toutes les transactions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [SALE, WITHDRAWAL] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des transactions }
 */
