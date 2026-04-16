const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Autenticación con tus credenciales del .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuración del almacenamiento
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nails_lab_services', // Cloudinary creará esta carpeta para ti
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Formatos permitidos
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optimización automática
  }
});

// 3. Empaquetamos todo en el middleware 'upload'
const upload = multer({ storage: storage });

module.exports = { upload };