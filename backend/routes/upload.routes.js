const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { verifyToken } = require('../middlewares/auth.middleware');

// Usamos verifyToken para que solo el ADMIN pueda subir fotos a tu nube
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen." });
    }
    
    // Si todo salió bien, Cloudinary nos devuelve la URL segura aquí:
    res.json({ imageUrl: req.file.path });
    
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error);
    res.status(500).json({ error: "Error al procesar la imagen." });
  }
});

module.exports = router;