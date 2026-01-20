import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrace nového uživatele
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Uživatel úspěšně zaregistrován
 *       400:
 *         description: Validační chyba nebo uživatel již existuje
 */
router.post(
  '/register',
  [
    body('name').isLength({ min: 3 }).withMessage('Jméno musí mít alespoň 3 znaky'),
    body('password').isLength({ min: 6 }).withMessage('Heslo musí mít alespoň 6 znaků'),
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Přihlášení uživatele
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Přihlášení úspěšné
 *       401:
 *         description: Neplatné přihlašovací údaje
 */
router.post(
  '/login',
  [
    body('name').notEmpty().withMessage('Jméno je povinné'),
    body('password').notEmpty().withMessage('Heslo je povinné'),
  ],
  login
);

export default router;
