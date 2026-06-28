const express = require('express');
const UserController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const { body, validationResult } = require('express-validator');

const router = express.Router();

const validateUser = [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];

router.get('/', verifyAdmin, UserController.getAllUsers);
router.post('/', validateUser, UserController.createUser);

router.get('/:id', verifyToken, UserController.getUserById);
router.put('/:id', verifyToken, UserController.updateUser);
router.put('/:id/password', verifyToken, UserController.changePassword);
router.delete('/:id', verifyToken, UserController.deleteUser);

module.exports = router;
