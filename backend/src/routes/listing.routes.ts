import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listing.controller';

const router = Router();

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Získat všechny inzeráty
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: carBrandId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: carModelId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         description: Čárkou oddělené ID tagů
 *     responses:
 *       200:
 *         description: Seznam inzerátů
 */
router.get('/', authenticate, getAllListings);

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Získat inzerát podle ID
 *     tags: [Listings]
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
 *         description: Detail inzerátu
 */
router.get('/:id', authenticate, getListingById);

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Vytvořit nový inzerát
 *     tags: [Listings]
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
 *               - price
 *               - link
 *               - imageLink
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               link:
 *                 type: string
 *               imageLink:
 *                 type: string
 *               carModelId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Inzerát vytvořen
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Název je povinný'),
    body('price').isFloat({ min: 0 }).withMessage('Cena musí být kladné číslo'),
    body('link').isURL().withMessage('Link musí být platná URL'),
    body('imageLink').isURL().withMessage('Obrázek musí být platná URL'),
  ],
  createListing
);

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Aktualizovat inzerát
 *     tags: [Listings]
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
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               link:
 *                 type: string
 *               imageLink:
 *                 type: string
 *               carModelId:
 *                 type: integer
 *               isDeleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Inzerát aktualizován
 */
router.put('/:id', authenticate, updateListing);

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Smazat inzerát
 *     tags: [Listings]
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
 *         description: Inzerát smazán
 */
router.delete('/:id', authenticate, deleteListing);

export default router;
