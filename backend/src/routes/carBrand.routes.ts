import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllCarBrands,
  getCarBrandById,
  createCarBrand,
  updateCarBrand,
  deleteCarBrand,
} from '../controllers/carBrand.controller';

const router = Router();

/**
 * @swagger
 * /api/carbrands:
 *   get:
 *     summary: Získat všechny značky aut
 *     tags: [CarBrands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seznam značek
 */
router.get('/', authenticate, getAllCarBrands);

/**
 * @swagger
 * /api/carbrands/{id}:
 *   get:
 *     summary: Získat značku podle ID
 *     tags: [CarBrands]
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
 *         description: Detail značky
 *       404:
 *         description: Značka nenalezena
 */
router.get('/:id', authenticate, getCarBrandById);

/**
 * @swagger
 * /api/carbrands:
 *   post:
 *     summary: Vytvořit novou značku
 *     tags: [CarBrands]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Značka vytvořena
 */
router.post(
  '/',
  authenticate,
  [body('name').notEmpty().withMessage('Název je povinný')],
  createCarBrand
);

/**
 * @swagger
 * /api/carbrands/{id}:
 *   put:
 *     summary: Aktualizovat značku
 *     tags: [CarBrands]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Značka aktualizována
 */
router.put(
  '/:id',
  authenticate,
  [body('name').notEmpty().withMessage('Název je povinný')],
  updateCarBrand
);

/**
 * @swagger
 * /api/carbrands/{id}:
 *   delete:
 *     summary: Smazat značku
 *     tags: [CarBrands]
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
 *         description: Značka smazána
 */
router.delete('/:id', authenticate, deleteCarBrand);

export default router;
