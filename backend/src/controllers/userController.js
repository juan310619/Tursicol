const User = require('../models/User');

class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createUser(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
            }

            const newUserId = await User.create(name, email, password);
            res.status(201).json({ message: "Usuario creado exitosamente", userId: newUserId });
        } catch (error) {
            res.status(500).json({ error: "No se pudo crear el usuario o el email ya existe" });
        }
    }

    static async updateUser(req, res) {
        try {
            const { name, email } = req.body;
            const changes = await User.update(req.params.id, name, email);
            if (changes === 0) return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
            res.json({ message: "Usuario actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.params.id;
            const bcrypt = require('bcrypt');

            const isMatch = await User.verifyPassword(userId, currentPassword);
            if (!isMatch) return res.status(400).json({ message: "La contraseña actual es incorrecta" });

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(userId, hashedPassword);
            
            res.json({ message: "Contraseña actualizada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            const changes = await User.delete(req.params.id);
            if (changes === 0) return res.status(404).json({ message: "Usuario no encontrado para borrar" });
            res.json({ message: "Usuario eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;
