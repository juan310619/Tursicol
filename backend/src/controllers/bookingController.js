const db = require('../../config/database');

class BookingController {
    static async createBooking(req, res) {
        try {
            const { destinationName, planName, price } = req.body;
            const userId = req.user.id; // Del middleware verifyToken

            db.run(
                `INSERT INTO bookings (destinationName, planName, price, userId) VALUES (?, ?, ?, ?)`,
                [destinationName, planName, price, userId],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: "¡Reserva realizada con éxito!", bookingId: this.lastID });
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMyBookings(req, res) {
        try {
            const userId = req.user.id;
            db.all(`SELECT * FROM bookings WHERE userId = ?`, [userId], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteBooking(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            db.run(`DELETE FROM bookings WHERE id = ? AND userId = ?`, [id, userId], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ message: "Reserva no encontrada o no autorizada" });
                res.json({ message: "Reserva eliminada con éxito" });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BookingController;
