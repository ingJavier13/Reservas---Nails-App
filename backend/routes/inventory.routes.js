const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// 1. OBTENER TODOS LOS MATERIALES
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const materials = await prisma.material.findMany();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
});

// 2. CREAR UN NUEVO MATERIAL
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, currentStock, minStock, unit, costPerUnit } = req.body;
    const material = await prisma.material.create({
      data: {
        name,
        currentStock: parseFloat(currentStock),
        minStock: parseFloat(minStock),
        unit, // PIEZA, MILILITROS, GRAMOS
        costPerUnit: parseFloat(costPerUnit) || 0
      }
    });

    // Registrar como gasto automáticamente si se registra con stock inicial
    if (parseFloat(currentStock) > 0 && parseFloat(costPerUnit) > 0) {
       await prisma.expense.create({
         data: {
           description: `Stock inicial: ${material.name} (${currentStock} ${material.unit})`,
           amount: parseFloat(currentStock) * parseFloat(costPerUnit)
         }
       });
    }

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: "Error al crear material" });
  }
});

// 3. ACTUALIZAR STOCK/MATERIAL (Y REGISTRAR GASTO DE RESURTIDO SI APLICA)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, currentStock, minStock, unit, costPerUnit, isRestock, quantityAdded } = req.body;

    const oldMaterial = await prisma.material.findUnique({ where: { id: parseInt(id) } });

    const data = {};
    if (name) data.name = name;
    if (minStock !== undefined) data.minStock = parseFloat(minStock);
    if (unit) data.unit = unit;
    if (costPerUnit !== undefined) data.costPerUnit = parseFloat(costPerUnit);
    if (currentStock !== undefined) data.currentStock = parseFloat(currentStock);

    const updated = await prisma.material.update({
      where: { id: parseInt(id) },
      data
    });

    // Si explícitamente se hizo un resurtido, creamos un GASTO
    if (isRestock && quantityAdded > 0) {
      await prisma.expense.create({
        data: {
          description: `Resurtido: ${updated.name} (+${quantityAdded} ${updated.unit})`,
          amount: quantityAdded * (updated.costPerUnit || 0)
        }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar material" });
  }
});

// 4. ELIMINAR MATERIAL
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.material.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "Material eliminado." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
