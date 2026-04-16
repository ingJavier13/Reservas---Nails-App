const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando la base de datos...");

  // 1. Limpiar datos anteriores (EL ORDEN IMPORTA)
  // Primero borramos las citas para no romper las llaves foráneas
  await prisma.appointment.deleteMany();
  // Ahora sí podemos borrar los servicios de forma segura
  await prisma.service.deleteMany();

  // 2. Crear servicios con imágenes reales de uñas
  const servicios = await prisma.service.createMany({
    data: [
      {
        name: 'Uñas Acrílicas - Set Básico',
        description: 'Aplicación de acrílico en un solo tono o francés clásico. Ideal para el día a día.',
        price: 350.00,
        duration: 90,
        imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop'
      },
      {
        name: 'Gelish sobre uña natural',
        description: 'Esmaltado en gel de larga duración. Gran variedad de colores y brillo impecable.',
        price: 200.00,
        duration: 45,
        imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=800&auto=format&fit=crop'
      },
      {
        name: 'Diseño 3D y Pedrería',
        description: 'Arte encapsulado, cristales Swarovski y diseños a mano alzada para eventos especiales.',
        price: 550.00,
        duration: 120,
        imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop'
      },
      {
        name: 'Manicura Spa',
        description: 'Exfoliación, masaje con crema hidratante, limpieza de cutícula y esmaltado tradicional.',
        price: 280.00,
        duration: 60,
        imageUrl: 'https://images.unsplash.com/photo-1633394582962-d98c255e2e46?q=80&w=800&auto=format&fit=crop'
      }
    ]
  });

  // 3. Crear tu usuario ADMIN
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt); // Aqui se genera la contraseña hasheada
  
  await prisma.user.upsert({
    where: { email: 'admin@nailslab.com' },
    update: {},
    create: {
      email: 'admin@nailslab.com',
      name: 'Javier Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`✅ ¡Listo! Se insertaron ${servicios.count} servicios premium y 1 Admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });