import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const categorySchema = z.object({
    name: z.string().min(1),
    type: z.enum(['INCOME', 'EXPENSE'])
});

// Get all categories
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.userId }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch categories', error });
    }
});

// Create category
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, type } = categorySchema.parse(req.body);

        const category = await prisma.category.create({
            data: {
                name,
                type,
                userId: req.userId!
            }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create category', error });
    }
});

export default router;