import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { name },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Uživatel s tímto jménem již existuje' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id, name: user.name });

    res.status(201).json({
      message: 'Uživatel úspěšně zaregistrován',
      user: {
        id: user.id,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Chyba při registraci' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, password } = req.body;

    // Find user
    const user = await prisma.user.findFirst({
      where: { name },
    });

    if (!user) {
      res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
      return;
    }

    // Generate token
    const token = generateToken({ userId: user.id, name: user.name });

    res.json({
      message: 'Přihlášení úspěšné',
      user: {
        id: user.id,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Chyba při přihlašování' });
  }
};
