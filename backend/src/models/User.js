const db = require('../../config/database');
const bcrypt = require('bcrypt');

class User {
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static findAll() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT id, name, email, role FROM users`, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id, name, email, role FROM users WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async create(name, email, password, role = 'user') {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, role],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static update(id, name, email) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET name = ?, email = ? WHERE id = ?`,
                [name, email, id],
                function (err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });
    }

    static findWithPassword(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id, name, email, password, role FROM users WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async verifyPassword(id, password) {
        const user = await this.findWithPassword(id);
        if (!user) return false;
        return await bcrypt.compare(password, user.password);
    }

    static updatePassword(id, newPassword) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [newPassword, id],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
}

module.exports = User;

