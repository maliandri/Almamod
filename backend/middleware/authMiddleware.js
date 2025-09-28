// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Obtener el token del header
  const token = req.header('x-auth-token'); // También es común usar 'Authorization': 'Bearer TOKEN'

  // 2. Chequear si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // 3. Verificar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Guardamos el payload del usuario en el request
    next(); // Pasamos al siguiente paso (la ruta protegida)
  } catch (err) {
    res.status(401).json({ msg: 'El Token no es válido' });
  }
};