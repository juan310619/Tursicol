const Itinerary = require('../models/Itinerary');

class ItineraryController {
    static async createItinerary(req, res) {
        try {
            const { destino, fecha_ida, fecha_vuelta, num_viajeros, presupuesto_estimado, tipo_viaje, observaciones } = req.body;
            const user_id = req.user.id; 

            if (!destino || !fecha_ida || !fecha_vuelta) {
                return res.status(400).json({ message: "Los campos básicos (destino y fechas) son requeridos" });
            }

            const id = await Itinerary.create(user_id, destino, fecha_ida, fecha_vuelta, num_viajeros, presupuesto_estimado, tipo_viaje, observaciones);
            res.status(201).json({ message: "Itinerario guardado con éxito", id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    static async getMyItineraries(req, res) {
        try {
            const user_id = req.user.id;
            const itineraries = await Itinerary.findByUserId(user_id);
            res.json(itineraries);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteItinerary(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const changes = await Itinerary.delete(id, user_id);

            if (changes === 0) return res.status(404).json({ message: "Itinerario no encontrado" });
            res.json({ message: "Itinerario eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateItinerary(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const changes = await Itinerary.update(id, user_id, req.body);

            if (changes === 0) return res.status(404).json({ message: "Itinerario no encontrado para actualizar" });
            res.json({ message: "Itinerario actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllItineraries(req, res) {
        try {
            const itineraries = await Itinerary.findAll();
            res.json(itineraries);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ItineraryController;
