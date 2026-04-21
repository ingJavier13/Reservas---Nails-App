require('dotenv').config(); // <-- ESTO DEBE IR HASTA ARRIBA
const express = require('express');
const cors = require('cors');

// Importar rutas
const appointmentRoutes = require('./routes/appointments.routes');
const authRoutes = require('./routes/auth.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const financeRoutes = require('./routes/finance.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas base
app.use('/appointments', appointmentRoutes);
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/finance', financeRoutes);

// Aquí puedes dejar rutas muy simples o moverlas después
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ruta para subir imágenes
const uploadRoutes = require('./routes/upload.routes');
app.use('/upload', uploadRoutes);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.get('/services', async (req, res) => {
  const services = await prisma.service.findMany({
    include: {
      materials: {
        include: { material: true }
      }
    }
  });
  res.json(services);
});

// POST: Crear un nuevo servicio (Protegido, idealmente solo para ADMIN)
const { verifyToken } = require('./middlewares/auth.middleware');

app.post('/services', verifyToken, async (req, res) => {
  try {
    const { name, description, price, duration, imageUrl, materials } = req.body;
    
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        imageUrl
      }
    });

    if (materials && materials.length > 0) {
      const materialsData = materials.map(m => ({
        serviceId: newService.id,
        materialId: parseInt(m.materialId),
        quantity: parseFloat(m.quantity)
      }));
      await prisma.serviceMaterial.createMany({ data: materialsData });
    }

    const createdService = await prisma.service.findUnique({
      where: { id: newService.id },
      include: { materials: { include: { material: true } } }
    });

    res.status(201).json(createdService);
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ error: "Error al guardar el servicio en la base de datos" });
  }
});

// PUT: Actualizar un servicio existente
app.put('/services/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'CLIENTE') return res.status(403).json({ error: "No tienes permisos" });
    
    const { id } = req.params;
    const { name, description, price, duration, imageUrl, materials } = req.body;
    
    const updatedService = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        ...(imageUrl && { imageUrl }) // Sólo actualiza la imagen si envían una nueva
      }
    });

    // Update materials Recipe
    if (materials !== undefined) {
      // Borrar anteriores
      await prisma.serviceMaterial.deleteMany({
        where: { serviceId: parseInt(id) }
      });
      // Insertar nuevos
      if (materials.length > 0) {
        const materialsData = materials.map(m => ({
          serviceId: parseInt(id),
          materialId: parseInt(m.materialId),
          quantity: parseFloat(m.quantity)
        }));
        await prisma.serviceMaterial.createMany({ data: materialsData });
      }
    }

    const refetchedService = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: { materials: { include: { material: true } } }
    });

    res.json(refetchedService);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ error: "Error al actualizar el servicio en la base de datos" });
  }
});

// DELETE: Eliminar un servicio
app.delete('/services/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'CLIENTE') return res.status(403).json({ error: "No tienes permisos" });
    
    const { id } = req.params;
    await prisma.service.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ error: "Error al eliminar el servicio de la base de datos" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});