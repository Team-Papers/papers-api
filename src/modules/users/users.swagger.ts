/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des profils utilisateurs
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Profil public d'un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Profil utilisateur }
 *       404: { description: Utilisateur non trouvé }
 *   put:
 *     tags: [Users]
 *     summary: Modifier son profil
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               avatarUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: Profil mis à jour }
 *   delete:
 *     tags: [Users]
 *     summary: Supprimer son compte
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Compte supprimé }
 */
