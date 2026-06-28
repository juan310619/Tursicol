const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        verifyTables();
    }
});

function verifyTables() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Migraciones para bases de datos existentes
    db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {});
    db.run(`ALTER TABLE users ADD COLUMN created_at DATETIME`, (err) => {
        if (!err) db.run(`UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
    });


    const createItinerariesTable = `
        CREATE TABLE IF NOT EXISTS itineraries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            destino TEXT NOT NULL,
            fecha_ida TEXT NOT NULL,
            fecha_vuelta TEXT NOT NULL,
            num_viajeros INTEGER DEFAULT 1,
            presupuesto_estimado REAL,
            tipo_viaje TEXT,
            observaciones TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `;

    db.run(`ALTER TABLE itineraries ADD COLUMN created_at DATETIME`, (err) => {
        if (!err) db.run(`UPDATE itineraries SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`);
    });

    const createBookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            destinationName TEXT NOT NULL,
            planName TEXT NOT NULL,
            price REAL NOT NULL,
            bookingDate TEXT DEFAULT CURRENT_TIMESTAMP,
            userId INTEGER,
            FOREIGN KEY(userId) REFERENCES users(id)
        )
    `;


    db.run(createUsersTable, (err) => {
        if (err) console.error('Error creando la tabla users:', err.message);
    });

    db.run(createItinerariesTable, (err) => {
        if (err) console.error('Error creando la tabla itineraries:', err.message);
    });

    db.run(createBookingsTable, (err) => {
        if (err) console.error('Error creando la tabla bookings:', err.message);
    });
}


module.exports = db;
