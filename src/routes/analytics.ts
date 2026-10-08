import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get analytics summary
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            include: { category: true }
        });

        const totalIncome = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        // Spending breakdown by category
        const spendingByCategory = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, t) => {
                const categoryName = t.category.name;
                acc[categoryName] = (acc[categoryName] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        res.json({
            totalIncome,
            totalExpense,
            balance,
            spendingByCategory
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch analytics', error });
    }
});

export default router;