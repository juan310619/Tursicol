const db = require('../../config/database');

class Itinerary {
    static create(user_id, destino, fecha_ida, fecha_vuelta, num_viajeros, presupuesto_estimado, tipo_viaje, observaciones) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO itineraries (user_id, destino, fecha_ida, fecha_vuelta, num_viajeros, presupuesto_estimado, tipo_viaje, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, destino, fecha_ida, fecha_vuelta, num_viajeros, presupuesto_estimado, tipo_viaje, observaciones],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }


    static findByUserId(user_id) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM itineraries WHERE user_id = ?`, [user_id], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static delete(id, user_id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM itineraries WHERE id = ? AND user_id = ?', [id, user_id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static update(id, user_id, data) {
        const fields = [];
        const values = [];

        for (const key in data) {
            if (['destino', 'fecha_ida', 'fecha_vuelta', 'num_viajeros', 'presupuesto_estimado', 'tipo_viaje', 'observaciones'].includes(key)) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        }

        if (fields.length === 0) return Promise.resolve(0);

        values.push(id, user_id);
        const sql = `UPDATE itineraries SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;

        return new Promise((resolve, reject) => {
            db.run(sql, values, function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static findAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT i.*, u.name as user_name, u.email as user_email 
                FROM itineraries i 
                JOIN users u ON i.user_id = u.id
                ORDER BY i.created_at DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = Itinerary;
