process.env.JWT_SECRET = 'test-secret-for-jwt';

const express = require('express');
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User');
const User = require('../../src/models/User');

const authRoutes = require('../../src/routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('AuthController - Login', () => {
    const mockUser = {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@test.com',
        password: bcrypt.hashSync('password123', 10),
        role: 'user',
    };

    beforeEach(() => jest.clearAllMocks());

    test('Login exitoso con credenciales válidas', async () => {
        User.findByEmail.mockResolvedValue(mockUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'juan@test.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.name).toBe('Juan Pérez');
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(1);
        expect(decoded.role).toBe('user');
    });

    test('Login con email inexistente retorna 401', async () => {
        User.findByEmail.mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'no@test.com', password: 'cualquier' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Correo o contraseña incorrectos');
    });

    test('Login con contraseña incorrecta retorna 401', async () => {
        User.findByEmail.mockResolvedValue(mockUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'juan@test.com', password: 'incorrecta' });
        expect(res.status).toBe(401);
    });

    test('Login con credenciales admin', async () => {
        User.findByEmail.mockResolvedValue({ ...mockUser, role: 'admin' });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('admin');
    });
});
