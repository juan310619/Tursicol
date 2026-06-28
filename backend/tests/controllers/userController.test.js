process.env.JWT_SECRET = 'test-secret-for-jwt';

const express = require('express');
const request = require('supertest');

jest.mock('../../src/models/User');
const User = require('../../src/models/User');

jest.mock('../../src/middleware/authMiddleware', () => ({
    verifyToken: (req, res, next) => { req.user = { id: 1, email: 't@t.com', role: 'user' }; next(); },
    verifyAdmin: (req, res, next) => { req.user = { id: 1, email: 'a@t.com', role: 'admin' }; next(); },
}));

const app = express();
app.use(express.json());
app.use('/api/users', require('../../src/routes/userRoutes'));

describe('UserController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Crear usuario con datos válidos retorna 201', async () => {
        User.create.mockResolvedValue(1);
        const res = await request(app).post('/api/users')
            .send({ name: 'Nuevo', email: 'nuevo@test.com', password: 'password123' });
        expect(res.status).toBe(201);
        expect(res.body.userId).toBe(1);
    });

    test('Crear usuario sin nombre retorna 400', async () => {
        const res = await request(app).post('/api/users')
            .send({ email: 't@t.com', password: 'pass123' });
        expect(res.status).toBe(400);
    });

    test('Crear usuario con email inválido retorna 400', async () => {
        const res = await request(app).post('/api/users')
            .send({ name: 'T', email: 'invalido', password: 'pass123' });
        expect(res.status).toBe(400);
    });

    test('Obtener usuario por ID - éxito', async () => {
        User.findById.mockResolvedValue({ id: 1, name: 'Juan', email: 'juan@t.com', role: 'user' });
        const res = await request(app).get('/api/users/1');
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Juan');
    });

    test('Obtener usuario inexistente retorna 404', async () => {
        User.findById.mockResolvedValue(null);
        const res = await request(app).get('/api/users/999');
        expect(res.status).toBe(404);
    });

    test('Actualizar y eliminar usuario existente', async () => {
        User.update.mockResolvedValue(1);
        User.delete.mockResolvedValue(1);
        expect((await request(app).put('/api/users/1').send({ name: 'X', email: 'x@t.com' })).status).toBe(200);
        expect((await request(app).delete('/api/users/1')).status).toBe(200);
    });

    test('Actualizar y eliminar usuario inexistente retorna 404', async () => {
        User.update.mockResolvedValue(0);
        User.delete.mockResolvedValue(0);
        expect((await request(app).put('/api/users/999').send({ name: 'X', email: 'x@t.com' })).status).toBe(404);
        expect((await request(app).delete('/api/users/999')).status).toBe(404);
    });
});
