const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: "No se proporcionó un token de autenticación" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Formato de token inválido" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
}

function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador" });
        }
    });
}

module.exports = { verifyToken, verifyAdmin };

