/**
 * @swagger
 * tags:
 *   name: Purchases
 *   description: Achats de livres
 */

/**
 * @swagger
 * /purchases:
 *   post:
 *     tags: [Purchases]
 *     summary: Initier un achat
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId, paymentMethod]
 *             properties:
 *               bookId: { type: string, format: uuid }
 *               paymentMethod: { type: string, enum: [MTN, OM] }
 *     responses:
 *       201: { description: Achat créé (statut pending) }
 *       409: { description: Livre déjà acheté }
 *   get:
 *     tags: [Purchases]
 *     summary: Mes achats
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Liste paginée des achats }
 *
 * /purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: Détail d'un achat
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Détail de l'achat }
 *       404: { description: Achat non trouvé }
 *
 * /purchases/{id}/mock-complete:
 *   post:
 *     tags: [Purchases]
 *     summary: Simuler un paiement réussi (dev only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Achat complété, livre ajouté à la bibliothèque }
 */
