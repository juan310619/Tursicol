process.env.JWT_SECRET = 'test-secret-for-jwt';

const express = require('express');
const request = require('supertest');

jest.mock('../../src/models/Itinerary');
const Itinerary = require('../../src/models/Itinerary');

jest.mock('../../src/middleware/authMiddleware', () => ({
    verifyToken: (req, res, next) => { req.user = { id: 1, role: 'user' }; next(); },
    verifyAdmin: (req, res, next) => { req.user = { id: 1, role: 'admin' }; next(); },
}));

const app = express();
app.use(express.json());
app.use('/api/itineraries', require('../../src/routes/itineraryRoutes'));

describe('ItineraryController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Crear itinerario con datos requeridos', async () => {
        Itinerary.create.mockResolvedValue(1);
        const res = await request(app).post('/api/itineraries')
            .send({ destino: 'Antioquia', fecha_ida: '2026-07-15', fecha_vuelta: '2026-07-20',
                num_viajeros: 2, presupuesto_estimado: 1500000, tipo_viaje: 'Aventura' });
        expect(res.status).toBe(201);
    });

    test('Crear itinerario sin destino retorna 400', async () => {
        const res = await request(app).post('/api/itineraries')
            .send({ fecha_ida: '2026-07-15', fecha_vuelta: '2026-07-20' });
        expect(res.status).toBe(400);
    });

    test('Obtener mis itinerarios', async () => {
        Itinerary.findByUserId.mockResolvedValue([{ id: 1, destino: 'Antioquia', user_id: 1 }]);
        const res = await request(app).get('/api/itineraries/my');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    test('Actualizar y eliminar itinerarios', async () => {
        Itinerary.update.mockResolvedValue(1);
        Itinerary.delete.mockResolvedValue(1);
        expect((await request(app).put('/api/itineraries/1').send({ presupuesto: 2000000 })).status).toBe(200);
        expect((await request(app).delete('/api/itineraries/1')).status).toBe(200);

        Itinerary.update.mockResolvedValue(0);
        Itinerary.delete.mockResolvedValue(0);
        expect((await request(app).put('/api/itineraries/999').send({})).status).toBe(404);
        expect((await request(app).delete('/api/itineraries/999')).status).toBe(404);
    });
});
