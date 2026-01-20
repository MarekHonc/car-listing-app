import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllCarBrands = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const carBrands = await prisma.carBrand.findMany({
      include: {
        carModels: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(carBrands);
  } catch (error) {
    console.error('Get car brands error:', error);
    res.status(500).json({ error: 'Chyba při načítání značek' });
  }
};

export const getCarBrandById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const carBrand = await prisma.carBrand.findUnique({
      where: { id: parseInt(id) },
      include: {
        carModels: true,
      },
    });

    if (!carBrand) {
      res.status(404).json({ error: 'Značka nenalezena' });
      return;
    }

    res.json(carBrand);
  } catch (error) {
    console.error('Get car brand error:', error);
    res.status(500).json({ error: 'Chyba při načítání značky' });
  }
};

export const createCarBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name } = req.body;

    const existingBrand = await prisma.carBrand.findUnique({
      where: { name },
    });

    if (existingBrand) {
      res.status(400).json({ error: 'Značka s tímto názvem již existuje' });
      return;
    }

    const carBrand = await prisma.carBrand.create({
      data: { name },
    });

    res.status(201).json(carBrand);
  } catch (error) {
    console.error('Create car brand error:', error);
    res.status(500).json({ error: 'Chyba při vytváření značky' });
  }
};

export const updateCarBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name } = req.body;

    const existingBrand = await prisma.carBrand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBrand) {
      res.status(404).json({ error: 'Značka nenalezena' });
      return;
    }

    const carBrand = await prisma.carBrand.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.json(carBrand);
  } catch (error) {
    console.error('Update car brand error:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci značky' });
  }
};

export const deleteCarBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingBrand = await prisma.carBrand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBrand) {
      res.status(404).json({ error: 'Značka nenalezena' });
      return;
    }

    await prisma.carBrand.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Značka úspěšně smazána' });
  } catch (error) {
    console.error('Delete car brand error:', error);
    res.status(500).json({ error: 'Chyba při mazání značky' });
  }
};
