const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middlewares/auth.middleware'); // <-- Importamos el guardia

const prisma = new PrismaClient();

// GET: Obtener citas (¡AHORA PROTEGIDO Y FILTRADO POR ROL!)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { id, role } = req.user; // El guardia nos dejó estos datos aquí

    let filter = {};

    // LÓGICA DE ROLES
    if (role === 'CLIENTE') {
      filter = { userId: id }; // Solo ve las citas que él agendó
    } else if (role === 'TRABAJADOR') {
      filter = { workerId: id }; // Solo ve las citas donde fue asignado a trabajar
    } 
    // Si es ADMIN, el filtro se queda vacío {} y Prisma trae TODAS las citas.

    const appointments = await prisma.appointment.findMany({
      where: filter,
      include: {
        user: true,    // Datos del cliente
        worker: true,  // Datos de la manicurista
        service: true  // Datos del servicio
      },
      orderBy: { date: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener citas" });
  }
});

// POST: Agendar una nueva cita (También protegido)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, serviceId } = req.body;
    
    if (!date || !serviceId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        date: new Date(date), 
        userId: req.user.id, // ¡Seguridad extrema! Sacamos el ID directo del token, no del body
        serviceId: parseInt(serviceId)
      }
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("❌ ERROR EN PRISMA:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Cancelar una cita (Protegido)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Cita cancelada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
});

// PATCH: Actualizar el estado de la cita (Para Admin/Trabajador)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar que el rol sea ADMIN o TRABAJADOR
    if (req.user.role === 'CLIENTE') {
      return res.status(403).json({ error: "No tienes permisos suficientes" });
    }

    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estado de la cita" });
  }
});

module.exports = router;