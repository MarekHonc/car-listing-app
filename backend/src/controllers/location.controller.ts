import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllLocations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Chyba při načítání lokalit' });
  }
};

export const createLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, zipCode } = req.body;

    const location = await prisma.location.create({
      data: { name, zipCode },
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Chyba při vytváření lokality' });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, zipCode } = req.body;

    const existingLocation = await prisma.location.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLocation) {
      res.status(404).json({ error: 'Lokalita nenalezena' });
      return;
    }

    const location = await prisma.location.update({
      where: { id: parseInt(id) },
      data: { name, zipCode },
    });

    res.json(location);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci lokality' });
  }
};

export const deleteLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingLocation = await prisma.location.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLocation) {
      res.status(404).json({ error: 'Lokalita nenalezena' });
      return;
    }

    await prisma.location.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Lokalita úspěšně smazána' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Chyba při mazání lokality' });
  }
};
