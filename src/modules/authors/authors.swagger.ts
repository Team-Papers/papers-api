/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Profils auteurs et candidatures
 */

/**
 * @swagger
 * /authors/apply:
 *   post:
 *     tags: [Authors]
 *     summary: Demander le statut auteur
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [penName]
 *             properties:
 *               penName: { type: string, minLength: 2 }
 *               bio: { type: string }
 *               website: { type: string, format: uri }
 *               twitter: { type: string }
 *               facebook: { type: string }
 *               mtnNumber: { type: string }
 *               omNumber: { type: string }
 *     responses:
 *       201: { description: Candidature soumise }
 *       409: { description: Candidature déjà existante }
 *
 * /authors/me:
 *   get:
 *     tags: [Authors]
 *     summary: Mon profil auteur
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil auteur }
 *       404: { description: Profil non trouvé }
 *   put:
 *     tags: [Authors]
 *     summary: Modifier mon profil auteur
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               penName: { type: string }
 *               bio: { type: string }
 *               photoUrl: { type: string, format: uri }
 *               website: { type: string, format: uri }
 *               twitter: { type: string }
 *               facebook: { type: string }
 *               mtnNumber: { type: string }
 *               omNumber: { type: string }
 *     responses:
 *       200: { description: Profil mis à jour }
 *
 * /authors:
 *   get:
 *     tags: [Authors]
 *     summary: Liste des auteurs publics
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des auteurs }
 *
 * /authors/{id}:
 *   get:
 *     tags: [Authors]
 *     summary: Profil public d'un auteur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Profil auteur public }
 *       404: { description: Auteur non trouvé }
 *
 * /authors/me/stats:
 *   get:
 *     tags: [Authors]
 *     summary: Statistiques auteur (ventes, revenus, notes)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats auteur }
 *
 * /authors/me/earnings:
 *   get:
 *     tags: [Authors]
 *     summary: Solde + historique des transactions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Solde et transactions paginées }
 */
