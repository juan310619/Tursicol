const sqlite3 = require('sqlite3').verbose();

jest.mock('../../config/database', () => {
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(':memory:');
});

const User = require('../../src/models/User');
const db = require('../../config/database');

describe('Modelo User', () => {
    beforeAll(async () => {
        await new Promise((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL, role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => err ? reject(err) : resolve());
        });
    });

    afterAll(() => {
        db.close();
    });

    test('Crear usuario con hash de contraseña', async () => {
        const userId = await User.create('Juan Pérez', 'juan@test.com', 'password123');
        expect(userId).toBeDefined();
        expect(typeof userId).toBe('number');
        const user = await User.findByEmail('juan@test.com');
        expect(user.name).toBe('Juan Pérez');
        expect(user.password).not.toBe('password123');
        expect(user.password).toMatch(/^\$2[ab]\$.{56}$/);
    });

    test('Encontrar usuario por email - éxito', async () => {
        await User.create('María García', 'maria@test.com', 'clave456');
        const user = await User.findByEmail('maria@test.com');
        expect(user).toBeDefined();
        expect(user.name).toBe('María García');
    });

    test('Encontrar usuario por email - inexistente', async () => {
        const user = await User.findByEmail('noexiste@test.com');
        expect(user).toBeUndefined();
    });

    test('Obtener todos los usuarios sin exponer contraseñas', async () => {
        const users = await User.findAll();
        users.forEach(user => expect(user.password).toBeUndefined());
    });

    test('Actualizar datos de usuario', async () => {
        await User.create('Original', 'orig@test.com', 'pass123');
        const user = await User.findByEmail('orig@test.com');
        const changes = await User.update(user.id, 'Actualizado', 'act@test.com');
        expect(changes).toBe(1);
        const updated = await User.findById(user.id);
        expect(updated.name).toBe('Actualizado');
    });

    test('Verificar contraseña correcta e incorrecta', async () => {
        await User.create('Test', 'test@test.com', 'miClaveSegura');
        const user = await User.findByEmail('test@test.com');
        expect(await User.verifyPassword(user.id, 'miClaveSegura')).toBe(true);
        expect(await User.verifyPassword(user.id, 'claveIncorrecta')).toBe(false);
    });

    test('Eliminar un usuario', async () => {
        await User.create('Delete', 'del@test.com', 'eliminar');
        const user = await User.findByEmail('del@test.com');
        expect(await User.delete(user.id)).toBe(1);
        expect(await User.findById(user.id)).toBeUndefined();
    });

    test('Crear usuario con email duplicado debe fallar', async () => {
        await User.create('Primero', 'dup@test.com', 'pass123');
        await expect(User.create('Segundo', 'dup@test.com', 'pass456'))
            .rejects.toBeDefined();
    });
});
