const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Filtros de fecha (por defecto este mes)
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Obtener Ingresos (Citas completadas/confirmadas)
    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ['COMPLETADA', 'CONFIRMADA'] } // Ambas cuentan como ingreso seguro
      },
      include: {
        service: true
      }
    });

    const income = appointments.reduce((sum, cita) => sum + (cita.service?.price || 0), 0);

    // 2. Obtener Gastos
    const expensesList = await prisma.expense.findMany({
      where: {
        date: { gte: start, lte: end }
      },
      orderBy: { date: 'desc' }
    });

    const expensesTotal = expensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // 3. Profit (Ganancia Neta)
    const profit = income - expensesTotal;

    res.json({
      metrics: {
        income,
        expensesTotal,
        profit
      },
      expenses: expensesList,
      appointmentsCount: appointments.length
    });
  } catch (error) {
    res.status(500).json({ error: "Error al generar reporte financiero" });
  }
});

// Registrar gasto manual
router.post('/expense', verifyToken, isAdmin, async (req, res) => {
  try {
    const { description, amount, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : undefined
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar gasto" });
  }
});

module.exports = router;
