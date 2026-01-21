import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller';

const router = Router();

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Získat všechny lokality
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seznam lokalit
 */
router.get('/', authenticate, getAllLocations);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Vytvořit novou lokalitu
 *     tags: [Locations]
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
 *               - zipCode
 *             properties:
 *               name:
 *                 type: string
 *               zipCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lokalita vytvořena
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Název je povinný'),
    body('zipCode').notEmpty().withMessage('PSČ je povinné'),
  ],
  createLocation
);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Aktualizovat lokalitu
 *     tags: [Locations]
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
 *               - zipCode
 *             properties:
 *               name:
 *                 type: string
 *               zipCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lokalita aktualizována
 */
router.put(
  '/:id',
  authenticate,
  [
    body('name').notEmpty().withMessage('Název je povinný'),
    body('zipCode').notEmpty().withMessage('PSČ je povinné'),
  ],
  updateLocation
);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Smazat lokalitu
 *     tags: [Locations]
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
 *         description: Lokalita smazána
 */
router.delete('/:id', authenticate, deleteLocation);

export default router;
