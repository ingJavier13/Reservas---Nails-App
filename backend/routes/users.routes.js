const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// 1. Obtener todos los usuarios (solo ADMIN)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { // Retornamos todo menos la contraseña
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// 2. Obtener solo los TRABAJADORES (Para rellenar el select de Asignar Manicurista)
router.get('/workers', verifyToken, async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: 'TRABAJADOR' },
      select: { id: true, name: true, phone: true }
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener manicuristas" });
  }
});

// 3. Cambiar rol a un usuario
router.patch('/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validar el rol enviado
    const rolesValidos = ['CLIENTE', 'TRABAJADOR', 'ADMIN'];
    if (!rolesValidos.includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, name: true, role: true } // Confirmación segura
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar de rol" });
  }
});

module.exports = router;
