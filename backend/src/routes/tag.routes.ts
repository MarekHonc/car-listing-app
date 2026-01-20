import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllTags,
  createTag,
  addTagToListing,
  removeTagFromListing,
} from '../controllers/tag.controller';

const router = Router();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Získat všechny štítky
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seznam štítků
 */
router.get('/', authenticate, getAllTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Vytvořit nový štítek
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Štítek vytvořen
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Název je povinný'),
    body('color').notEmpty().withMessage('Barva je povinná'),
  ],
  createTag
);

/**
 * @swagger
 * /api/tags/listing:
 *   post:
 *     summary: Přidat štítek k inzerátu
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagId
 *               - listingId
 *             properties:
 *               tagId:
 *                 type: integer
 *               listingId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Štítek přidán k inzerátu
 */
router.post(
  '/listing',
  authenticate,
  [
    body('tagId').isInt().withMessage('ID štítku musí být číslo'),
    body('listingId').isInt().withMessage('ID inzerátu musí být číslo'),
  ],
  addTagToListing
);

/**
 * @swagger
 * /api/tags/{tagId}/listing/{listingId}:
 *   delete:
 *     summary: Odebrat štítek z inzerátu
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Štítek odebrán z inzerátu
 */
router.delete('/:tagId/listing/:listingId', authenticate, removeTagFromListing);

export default router;
