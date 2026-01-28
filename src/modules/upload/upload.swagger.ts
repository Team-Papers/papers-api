/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload de fichiers (couvertures et manuscrits)
 */

/**
 * @swagger
 * /upload/cover:
 *   post:
 *     tags: [Upload]
 *     summary: Upload couverture (max 5MB, JPG/PNG/WebP)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: URL de la couverture uploadée }
 *       400: { description: Fichier invalide }
 *
 * /upload/book:
 *   post:
 *     tags: [Upload]
 *     summary: Upload manuscrit (max 100MB, PDF/ePub)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: URL et métadonnées du fichier }
 *       400: { description: Fichier invalide }
 */
