const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_nails_lab_2026';

const verifyToken = (req, res, next) => {
  // 1. Buscamos el token en los headers de la petición
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // El formato es "Bearer TOKEN_AQUI"

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. No hay token." });
  }

  try {
    // 2. Verificamos que el token sea válido y no haya expirado
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Guardamos los datos del usuario en la petición para que las rutas lo puedan usar
    req.user = decoded; 
    next(); // Le decimos que pase a la ruta
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ error: "Acceso denegado. Se requiere nivel de administrador." });
  }
};

module.exports = { verifyToken, isAdmin };