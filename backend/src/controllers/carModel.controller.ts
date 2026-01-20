import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllCarModels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { carBrandId } = req.query;
    
    const where = carBrandId ? { carBrandId: parseInt(carBrandId as string) } : {};

    const carModels = await prisma.carModel.findMany({
      where,
      include: {
        carBrand: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(carModels);
  } catch (error) {
    console.error('Get car models error:', error);
    res.status(500).json({ error: 'Chyba při načítání modelů' });
  }
};

export const getCarModelById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const carModel = await prisma.carModel.findUnique({
      where: { id: parseInt(id) },
      include: {
        carBrand: true,
      },
    });

    if (!carModel) {
      res.status(404).json({ error: 'Model nenalezen' });
      return;
    }

    res.json(carModel);
  } catch (error) {
    console.error('Get car model error:', error);
    res.status(500).json({ error: 'Chyba při načítání modelu' });
  }
};

export const createCarModel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, carBrandId, engine, power } = req.body;

    const carBrand = await prisma.carBrand.findUnique({
      where: { id: carBrandId },
    });

    if (!carBrand) {
      res.status(404).json({ error: 'Značka nenalezena' });
      return;
    }

    const carModel = await prisma.carModel.create({
      data: {
        name,
        carBrandId,
        engine,
        power,
      },
      include: {
        carBrand: true,
      },
    });

    res.status(201).json(carModel);
  } catch (error) {
    console.error('Create car model error:', error);
    res.status(500).json({ error: 'Chyba při vytváření modelu' });
  }
};

export const updateCarModel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, carBrandId, engine, power } = req.body;

    const existingModel = await prisma.carModel.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingModel) {
      res.status(404).json({ error: 'Model nenalezen' });
      return;
    }

    if (carBrandId) {
      const carBrand = await prisma.carBrand.findUnique({
        where: { id: carBrandId },
      });

      if (!carBrand) {
        res.status(404).json({ error: 'Značka nenalezena' });
        return;
      }
    }

    const carModel = await prisma.carModel.update({
      where: { id: parseInt(id) },
      data: {
        name,
        carBrandId,
        engine,
        power,
      },
      include: {
        carBrand: true,
      },
    });

    res.json(carModel);
  } catch (error) {
    console.error('Update car model error:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci modelu' });
  }
};

export const deleteCarModel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingModel = await prisma.carModel.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingModel) {
      res.status(404).json({ error: 'Model nenalezen' });
      return;
    }

    await prisma.carModel.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Model úspěšně smazán' });
  } catch (error) {
    console.error('Delete car model error:', error);
    res.status(500).json({ error: 'Chyba při mazání modelu' });
  }
};
