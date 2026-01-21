import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { carBrandId, carModelId, tagIds } = req.query;
    
    const where: any = {};

    if (carBrandId) {
      where.carModel = {
        carBrandId: parseInt(carBrandId as string),
      };
    }

    if (carModelId) {
      where.carModelId = parseInt(carModelId as string);
    }

    if (tagIds) {
      const tagIdArray = (tagIds as string).split(',').map(id => parseInt(id));
      where.tagToListings = {
        some: {
          tagId: { in: tagIdArray },
        },
      };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        carModel: {
          include: {
            carBrand: true,
          },
        },
        location: true,
        addedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
          include: {
            addedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tagToListings: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(listings);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Chyba při načítání inzerátů' });
  }
};

export const getListingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        carModel: {
          include: {
            carBrand: true,
          },
        },
        location: true,
        addedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: {
            date: 'asc',
          },
          include: {
            addedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tagToListings: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ error: 'Inzerát nenalezen' });
      return;
    }

    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Chyba při načítání inzerátu' });
  }
};

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, price, link, imageLink, carModelId, locationId } = req.body;
    const userId = req.user!.userId;

    if (carModelId) {
      const carModel = await prisma.carModel.findUnique({
        where: { id: carModelId },
      });

      if (!carModel) {
        res.status(404).json({ error: 'Model nenalezen' });
        return;
      }
    }

    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        res.status(404).json({ error: 'Lokalita nenalezena' });
        return;
      }
    }

    const listing = await prisma.listing.create({
      data: {
        name,
        price,
        link,
        imageLink,
        carModelId: carModelId || null,
        locationId: locationId || null,
        addedByUserId: userId,
      },
      include: {
        carModel: {
          include: {
            carBrand: true,
          },
        },
        location: true,
        addedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Chyba při vytváření inzerátu' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, price, link, imageLink, carModelId, locationId, isDeleted } = req.body;

    const existingListing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingListing) {
      res.status(404).json({ error: 'Inzerát nenalezen' });
      return;
    }

    if (carModelId) {
      const carModel = await prisma.carModel.findUnique({
        where: { id: carModelId },
      });

      if (!carModel) {
        res.status(404).json({ error: 'Model nenalezen' });
        return;
      }
    }

    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        res.status(404).json({ error: 'Lokalita nenalezena' });
        return;
      }
    }

    const listing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price,
        link,
        imageLink,
        carModelId: carModelId || null,
        locationId: locationId || null,
        isDeleted,
      },
      include: {
        carModel: {
          include: {
            carBrand: true,
          },
        },
        location: true,
        addedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(listing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci inzerátu' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingListing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingListing) {
      res.status(404).json({ error: 'Inzerát nenalezen' });
      return;
    }

    await prisma.listing.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Inzerát úspěšně smazán' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Chyba při mazání inzerátu' });
  }
};
