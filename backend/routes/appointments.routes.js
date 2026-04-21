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

// PATCH: Cancelar una cita (Protegido - Actualiza estado en vez de borrar)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Verificar permisos:
    const cita = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    // Solo ADMIN o el que creyó la cita puede cancelarla
    if (req.user.role !== 'ADMIN' && cita.userId !== req.user.id) {
       return res.status(403).json({ error: "No puedes cancelar esta cita" });
    }

    const updated = await prisma.appointment.update({ 
      where: { id: parseInt(id) },
      data: {
        status: 'CANCELADA',
        cancellationReason: reason || "Cancelada por el usuario"
      }
    });

    res.json({ message: "Cita cancelada correctamente", appointment: updated });
  } catch (error) {
    console.error(error);
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
    
    // Si la cita se marcó como COMPLETADA, descontamos inventario
    if (status === 'COMPLETADA') {
      const citaInfo = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: { service: { include: { materials: true } } }
      });
      if (citaInfo?.service?.materials?.length > 0) {
        for (const sm of citaInfo.service.materials) {
          await prisma.material.update({
            where: { id: sm.materialId },
            data: { currentStock: { decrement: sm.quantity } }
          });
        }
      }
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estado de la cita" });
  }
});

// PATCH: Asignar cita a un manicurista
router.patch('/:id/assign', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;
    
    // Solo permitimos a los administradores asignar citas
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Solo los administradores pueden asignar personal a las citas" });
    }

    const unassignedApt = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    if (!unassignedApt) return res.status(404).json({ error: "Cita no encontrada" });

    // Actualizamos
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { workerId: workerId ? parseInt(workerId) : null }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar manicurista" });
  }
});

module.exports = router;