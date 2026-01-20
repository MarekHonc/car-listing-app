import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Chyba při načítání štítků' });
  }
};

export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, color } = req.body;

    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      res.status(400).json({ error: 'Štítek s tímto názvem již existuje' });
      return;
    }

    const tag = await prisma.tag.create({
      data: { name, color },
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Chyba při vytváření štítku' });
  }
};

export const addTagToListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { tagId, listingId } = req.body;
    const userId = req.user!.userId;

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      res.status(404).json({ error: 'Štítek nenalezen' });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      res.status(404).json({ error: 'Inzerát nenalezen' });
      return;
    }

    const existingTagToListing = await prisma.tagToListing.findUnique({
      where: {
        tagId_listingId_userId: {
          tagId,
          listingId,
          userId,
        },
      },
    });

    if (existingTagToListing) {
      res.status(400).json({ error: 'Štítek již přiřazen k tomuto inzerátu' });
      return;
    }

    const tagToListing = await prisma.tagToListing.create({
      data: {
        tagId,
        listingId,
        userId,
      },
      include: {
        tag: true,
      },
    });

    res.status(201).json(tagToListing);
  } catch (error) {
    console.error('Add tag to listing error:', error);
    res.status(500).json({ error: 'Chyba při přidávání štítku k inzerátu' });
  }
};

export const removeTagFromListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tagId, listingId } = req.params;
    const userId = req.user!.userId;

    const existingTagToListing = await prisma.tagToListing.findUnique({
      where: {
        tagId_listingId_userId: {
          tagId: parseInt(tagId),
          listingId: parseInt(listingId),
          userId,
        },
      },
    });

    if (!existingTagToListing) {
      res.status(404).json({ error: 'Štítek není přiřazen k tomuto inzerátu' });
      return;
    }

    await prisma.tagToListing.delete({
      where: {
        tagId_listingId_userId: {
          tagId: parseInt(tagId),
          listingId: parseInt(listingId),
          userId,
        },
      },
    });

    res.json({ message: 'Štítek úspěšně odebrán z inzerátu' });
  } catch (error) {
    console.error('Remove tag from listing error:', error);
    res.status(500).json({ error: 'Chyba při odebírání štítku z inzerátu' });
  }
};
