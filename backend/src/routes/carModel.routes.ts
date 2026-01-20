import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllCarModels,
  getCarModelById,
  createCarModel,
  updateCarModel,
  deleteCarModel,
} from '../controllers/carModel.controller';

const router = Router();

/**
 * @swagger
 * /api/carmodels:
 *   get:
 *     summary: Získat všechny modely aut
 *     tags: [CarModels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: carBrandId
 *         schema:
 *           type: integer
 *         description: Filtr podle značky
 *     responses:
 *       200:
 *         description: Seznam modelů
 */
router.get('/', authenticate, getAllCarModels);

/**
 * @swagger
 * /api/carmodels/{id}:
 *   get:
 *     summary: Získat model podle ID
 *     tags: [CarModels]
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
 *         description: Detail modelu
 */
router.get('/:id', authenticate, getCarModelById);

/**
 * @swagger
 * /api/carmodels:
 *   post:
 *     summary: Vytvořit nový model
 *     tags: [CarModels]
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
 *               - carBrandId
 *               - engine
 *               - power
 *             properties:
 *               name:
 *                 type: string
 *               carBrandId:
 *                 type: integer
 *               engine:
 *                 type: string
 *               power:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Model vytvořen
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Název je povinný'),
    body('carBrandId').isInt().withMessage('ID značky musí být číslo'),
    body('engine').notEmpty().withMessage('Motor je povinný'),
    body('power').isInt({ min: 1 }).withMessage('Výkon musí být kladné číslo'),
  ],
  createCarModel
);

/**
 * @swagger
 * /api/carmodels/{id}:
 *   put:
 *     summary: Aktualizovat model
 *     tags: [CarModels]
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
 *               carBrandId:
 *                 type: integer
 *               engine:
 *                 type: string
 *               power:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Model aktualizován
 */
router.put('/:id', authenticate, updateCarModel);

/**
 * @swagger
 * /api/carmodels/{id}:
 *   delete:
 *     summary: Smazat model
 *     tags: [CarModels]
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
 *         description: Model smazán
 */
router.delete('/:id', authenticate, deleteCarModel);

export default router;
