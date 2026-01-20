import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';

const router = Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Vytvořit nový komentář
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - listingId
 *             properties:
 *               text:
 *                 type: string
 *               listingId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Komentář vytvořen
 */
router.post(
  '/',
  authenticate,
  [
    body('text').notEmpty().withMessage('Text je povinný'),
    body('listingId').isInt().withMessage('ID inzerátu musí být číslo'),
  ],
  createComment
);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Aktualizovat komentář
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Komentář aktualizován
 */
router.put(
  '/:id',
  authenticate,
  [body('text').notEmpty().withMessage('Text je povinný')],
  updateComment
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Smazat komentář
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Komentář smazán
 */
router.delete('/:id', authenticate, deleteComment);

export default router;
