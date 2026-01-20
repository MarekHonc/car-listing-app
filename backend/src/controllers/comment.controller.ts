import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { text, listingId } = req.body;
    const userId = req.user!.userId;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      res.status(404).json({ error: 'Inzerát nenalezen' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        listingId,
        addedByUserId: userId,
      },
      include: {
        addedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Chyba při vytváření komentáře' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user!.userId;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Komentář nenalezen' });
      return;
    }

    if (existingComment.addedByUserId !== userId) {
      res.status(403).json({ error: 'Nemáte oprávnění upravit tento komentář' });
      return;
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { text },
      include: {
        addedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci komentáře' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Komentář nenalezen' });
      return;
    }

    if (existingComment.addedByUserId !== userId) {
      res.status(403).json({ error: 'Nemáte oprávnění smazat tento komentář' });
      return;
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Komentář úspěšně smazán' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Chyba při mazání komentáře' });
  }
};
