const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET;

class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(401).json({ message: "Correo o contraseña incorrectos" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Correo o contraseña incorrectos" });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                SECRET_KEY,
                { expiresIn: '30m' }
            );

            res.json({ 
                message: "Autenticación exitosa", 
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error en el servidor durante el login" });
        }
    }
}

module.exports = AuthController;

