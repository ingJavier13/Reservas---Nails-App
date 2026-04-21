# 💅 Nails.Lab ERP & CRM Platform

Plataforma integral (Full-Stack) diseñada para la gestión premium de un salón de belleza. 
Va mucho más allá de una simple agenda temporal, introduciendo un potente motor empresarial que controla de forma unificada: **citas automatizadas, finanzas en tiempo real, inventario atado a recetas (BOM) y gestión de tu staff corporativo.**

---

## 🌟 Características Principales

### 1. Sistema de Roles (Control del Staff Administrativo)
- **👑 ADMIN (Dueña)**: Control total sobre el negocio. Tiene acceso a reportes financieros confidenciales, manejo de bodega (inventario), creación de servicios, ascensos en directorios de staff y panel maestro de citas.
- **👩‍🎨 TRABAJADOR (Manicurista)**: Un panel simplificado y amigable con *tablets* o móviles. Le permite ver el catálogo, chatear directo al WhatsApp de un cliente y administrar EXCLUSIVAMENTE las citas que se le han asignado. Podrá presionar "**✓ Completar**" cuando finalice el esmaltado.
- **🤍 CLIENTE**: Puede navegar por el pulcro catálogo de servicios, abrirse una cuenta ligada a su teléfono local y agendar/cancelar citas de forma inmersiva, sencilla y rápida. 

### 2. Gestión Inteligente de Citas 
- **Filtros Avanzados:** Por fecha, estatus o búsqueda instantánea por cliente/servicio en el Panel Administrativo.
- **Asignación a Empleados:** El Admin puede enrutar una petición de cita hacia el calendario de una manicurista estelar seleccionada de su nómina.
- **Alertas Anti-Cancelación:** Modales disuasorios informando sobre las políticas de negocio y el anticipo si el cliente decide no asistir.

### 3. ERP de Doble Riel: Financiero e Inventario (Bodega)
- **Recetas por Proyecto (BOM):** Un servicio como el "Acrílico Escultural" consumirá internamente un número variable de gramos (`g`), mililitros (`ml`) o unidades (`piezas enteras`) de material de tu elección.
- **Control Físico y Mermas:** Al momento en que una Manicurista pulsa "COMPLETADA", la bodega descuenta la receta original de forma automática; sin que toques los números. Además, si el `Stock Mínimo` corre peligro, emite alarmas visuales intermitentes.
- **Flujo de Caja Inmediato:** Cada servicio completado inyecta la liquidez en tus gráficas de ganancia. Al resurtir botellas presionando `+ Surtir` se registrarán automáticamente tus costos; lo que arrojará un perfecto cálculo de **Tu Margen Neto / Profit** en la pestaña dorada de Finanzas.

---

## 🛠️ Stack Tecnológico (Músculo Operativo)

**Frontend (Client-side):**
- **React.js (Vite)**: Motor ultra rápido para Single Page Application (SPA).
- **Tailwind CSS**: Diseño boutique implementado en paleta nativa elegante (Tonos Navy/Slate Dark, Esmalte/Teal, Dorado/Amber y Terracota/Rose).
- **Axios**: Conectividad HTTP persistente.
- **React-Icons**: Biblioteca Vectorial limada en Material Design (`Md`).

**Backend (Server-side & API REST):**
- **Node.js + Express**: Servidor estable, estructurado a base de *Routers*.
- **Prisma (ORM)**: El mejor puente declarativo de conexión con la arquitectura de Base de Datos.
- **PostgreSQL**: Base de datos relacional para guardar desde decimales financieros exactos hasta catálogos complejos con interdependencia.
- **JWT (JSON Web Tokens) & Bcrypt**: Esquemas de seguridad criptográfica obligatoria y *middleware* férreo de protección de rutas privadas.

---

## 🚀 Instalación y Puesta en Marcha (Entorno Local)

Sigue estos pasos si necesitas levantar tus dos servidores de desarrollo desde tu IDE actual:

### 1. Variables de Entorno Seguras
Asegúrate de contar con un archivo secreto `.env` dentro de `/backend` con la ruta de tu base de datos y tus firmas y contraseñas de nube:
```env
DATABASE_URL="postgresql://USUARIO:CONTRASENA@localhost:5432/nails_appointments"
JWT_SECRET="super_secreto_personal_xyz"
PORT=3000
CLOUDINARY_URL="..." 
```

### 2. Arranque del Backend (Servidor Lógico)
Abre tu consola incrustada referenciada al `/backend`:
```bash
cd backend
npm install
npx prisma db push      # Autocompila la estructura de PostgreSQL de acuerdo a Schema.prisma
npx prisma generate     # Regenera los contratos de tipos
npm run dev             # Arranca nodemon en el http://localhost:3000
```

### 3. Arranque del Frontend (El rostro de la empresa)
Abre otra ventana de tu consola paralela y referencia al `/frontend`:
```bash
cd frontend
npm install
npm run dev             # Vite compilrará y abrirá tu puerto local instantáneo http://localhost:5173/
```

---

## 📸 Guía Breve de la Lógica Artística de UI
- Este sistema evita el uso de librerías sobrecargadas pre-fabricadas y botones gigantes carentes de estética.
- Se utilizan Sombras Ambientales (`shadow-2xl` y `backdrop-blur`) en los formularios para conseguir estética *Glass (Vidrio)*.
- Se implemantaron Textos *Tracking-widest* en las etiquetas miniatura emulando a la perfección interfaces de diseñadores de alta moda.
- Dispone de transiciones CSS nativas en `Hover` para micro interacciones que aportan gran dinamismo cada que pases tu ratón por los paneles.

---

## 🔑 Base de Datos y Cuentas de Prueba (Seed)

Si necesitas arrancar el proyecto de cero con datos pre-cargados para realizar pruebas locales (como Citas de Prueba, Servicios pre-creados o Administradores ya configurados), cuentas con un script **Seed** (Semilla).

Ejecuta en tu terminal apuntando al `/backend`:
```bash
npx prisma db seed
```

**Con esto se crearán instantáneamente las siguientes cuentas de prueba:**

| Rango/Rol | Correo (Email) | Contraseña |
| --- | --- | --- |
| **Administrador** | `admin@nailslab.com` | `123456` |
| **Manicurista (Trabajador)** | `staff@nailslab.com` | `123` |
| **Cliente Frecuente** | `prueba@gmail.com` | `1234` |

Utiliza la cuenta de Administrador en tu primer inicio de sesión para configurar y explorar las tres fases íntegras de tu plataforma.
