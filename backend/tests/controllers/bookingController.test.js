process.env.JWT_SECRET = 'test-secret-for-jwt';

const express = require('express');
const request = require('supertest');

jest.mock('../../config/database', () => {
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(':memory:');
});

jest.mock('../../src/middleware/authMiddleware', () => ({
    verifyToken: (req, res, next) => { req.user = { id: 1, role: 'user' }; next(); },
}));

const app = express();
app.use(express.json());
app.use('/api/bookings', require('../../src/routes/bookingRoutes'));
const db = require('../../config/database');

describe('BookingController', () => {
    beforeAll(async () => {
        await new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                destinationName TEXT NOT NULL,
                planName TEXT NOT NULL,
                price REAL NOT NULL,
                bookingDate TEXT DEFAULT CURRENT_TIMESTAMP,
                userId INTEGER
            )`, (err) => err ? reject(err) : resolve());
        });
    });

    afterAll(() => {
        db.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Crear reserva con datos válidos', async () => {
        const res = await request(app).post('/api/bookings')
            .send({ destinationName: 'Antioquia', planName: 'Tour Guatapé', price: 150000 });
        expect(res.status).toBe(201);
        expect(res.body.bookingId).toBeDefined();
    });

    test('Obtener mis reservas', async () => {
        const res = await request(app).get('/api/bookings/my');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Eliminar reserva existente', async () => {
        const createRes = await request(app).post('/api/bookings')
            .send({ destinationName: 'Magdalena', planName: 'Tayrona', price: 180000 });
        const bookingId = createRes.body.bookingId;
        const res = await request(app).delete(`/api/bookings/${bookingId}`);
        expect(res.status).toBe(200);
    });

    test('Eliminar reserva inexistente retorna 404', async () => {
        const res = await request(app).delete('/api/bookings/999');
        expect(res.status).toBe(404);
    });
});
