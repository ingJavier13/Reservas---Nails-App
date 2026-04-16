# Proyecto de Reservas - Nails App

¡Bienvenido! Este es el código fuente del aplicativo web para gestión de citas.

## 🚀 Cómo inicializar el proyecto localmente

### 1. Levantar el Frontend
Abre tu terminal, navega hacia la carpeta correspondiente e inicia el servidor en modo desarrollo:
```bash
cd frontend
npm run dev
```

### 2. Levantar el Backend
En otra ventana de la terminal, ingresa al backend y corre el servidor de desarrollo:
```bash
cd backend
npm run dev
```

---

## 💾 Gestión de la Base de Datos con Prisma

Cualquier comando de base de datos se debe ejecutar **estando dentro de la carpeta de `backend`**.

### Migración inicial
Para correr migraciones y sincronizar la base de datos:
```bash
npx prisma migrate dev --name init
```

### Generar cliente
```bash
npx prisma generate
```

### Al actualizar el archivo de schema
Cada vez que exista algún cambio nuevo en el schema de prisma, necesitas aplicar esos cambios con:
```bash
npx prisma db push
npx prisma generate
```

### Consultar la Base de Datos Visualmente
Prisma incluye su propio administrador con interfaz gráfica para ver tus registros:
```bash
npx prisma studio
```

---

## 🌱 Seeders (Datos Iniciales)

Para poblar tu base de datos con datos de prueba, ejecuta en la carpeta de `backend`:
```bash
npx prisma db seed
```
*(Alternativa: `node seed.js`)*

### Cuentas de Acceso de Prueba

Con los seeders aplicados, tendrás disponible la siguiente información para pruebas:

**👩‍💻 Cuenta Administrador**
- **Email:** `admin@nailslab.com`
- **Password:** `123456`

**💅 Cuenta de Cliente**
- **Name:** `Javier Test`
- **Role:** `CLIENTE`
- **Email:** `prueba@gmail.com`
- **Password:** `1234`
