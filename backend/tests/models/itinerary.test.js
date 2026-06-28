const sqlite3 = require('sqlite3').verbose();

jest.mock('../../config/database', () => {
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(':memory:');
});

const Itinerary = require('../../src/models/Itinerary');
const db = require('../../config/database');

describe('Modelo Itinerary', () => {
    beforeAll(async () => {
        await new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT, email TEXT, password TEXT, role TEXT DEFAULT 'user'
            )`, (err) => err ? reject(err) : resolve());
        });
        await new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS itineraries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL, destino TEXT NOT NULL,
                fecha_ida TEXT NOT NULL, fecha_vuelta TEXT NOT NULL,
                num_viajeros INTEGER DEFAULT 1, presupuesto_estimado REAL,
                tipo_viaje TEXT, observaciones TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => err ? reject(err) : resolve());
        });
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (name, email, password) VALUES (?,?,?)`,
                ['Test', 't@t.com', 'hash'], function (err) {
                    err ? reject(err) : resolve();
                });
        });
    });

    afterAll(() => {
        db.close();
    });

    test('Crear itinerario con datos completos', async () => {
        const id = await Itinerary.create(1, 'Antioquia', '2026-07-15', '2026-07-20',
            2, 1500000, 'Aventura', 'Visitar Guatapé');
        expect(id).toBeDefined();
        expect(typeof id).toBe('number');
    });

    test('Buscar itinerarios por user_id', async () => {
        await Itinerary.create(1, 'Bogotá', '2026-08-01', '2026-08-05', 1, 500000, 'Cultural', '');
        const list = await Itinerary.findByUserId(1);
        expect(list.length).toBeGreaterThanOrEqual(2);
        list.forEach(it => expect(it.user_id).toBe(1));
    });

    test('Actualizar selectivamente campos', async () => {
        const id = await Itinerary.create(1, 'Meta', '2026-09-10', '2026-09-15', 3, 2000000, 'Aventura', '');
        const changes = await Itinerary.update(id, 1, { presupuesto_estimado: 2500000, observaciones: 'Incluir caminata' });
        expect(changes).toBe(1);
    });

    test('Actualizar con datos vacíos retorna 0', async () => {
        expect(await Itinerary.update(1, 1, {})).toBe(0);
    });

    test('No eliminar itinerario de otro usuario', async () => {
        const id = await Itinerary.create(1, 'Bolívar', '2026-11-01', '2026-11-05', 1, 300000, 'Cultural', '');
        expect(await Itinerary.delete(id, 999)).toBe(0);
        expect(await Itinerary.delete(id, 1)).toBe(1);
    });

    test('Obtener todos con datos del usuario', async () => {
        const all = await Itinerary.findAll();
        expect(all.length).toBeGreaterThan(0);
        expect(all[0]).toHaveProperty('user_name');
        expect(all[0]).toHaveProperty('user_email');
    });
});
