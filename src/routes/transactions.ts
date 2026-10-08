import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const transactionSchema = z.object({
    amount: z.number().positive(),
    date: z.string(),
    note: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string()
});

// Get all transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            include: { category: true },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch transactions', error });
    }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { amount, date, note, type, categoryId } = transactionSchema.parse(req.body);

        const transaction = await prisma.transaction.create({
            data: {
                amount,
                date: new Date(date),
                note,
                type,
                categoryId,
                userId: req.userId!
            }
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create transaction', error });
    }
});

// Delete transaction
// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.transaction.delete({
            where: {
                id: req.params.id as string
            }
        });
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to delete transaction', error });
    }
});

export default router;