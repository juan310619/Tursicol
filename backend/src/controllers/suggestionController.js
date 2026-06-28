const Suggestion = require('../models/Suggestion');

class SuggestionController {
    static async createSuggestion(req, res) {
        try {
            const { nombre_lugar, ubicacion, descripcion } = req.body;
            const user_id = req.user.id;

            if (!nombre_lugar || !ubicacion || !descripcion) {
                return res.status(400).json({ message: "Todos los campos son requeridos" });
            }

            const newDoc = await Suggestion.create(user_id, nombre_lugar, ubicacion, descripcion);
            res.status(201).json({ message: "Sugerencia enviada a base de datos NoSQL", id: newDoc._id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllSuggestions(req, res) {
        try {
            const suggestions = await Suggestion.findAll();
            res.json(suggestions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateSuggestion(req, res) {
        try {
            const { id } = req.params;
            const numAffected = await Suggestion.update(id, req.body);
            if (numAffected === 0) return res.status(404).json({ message: "Sugerencia no encontrada" });
            res.json({ message: "Sugerencia actualizada en NoSQL" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteSuggestion(req, res) {
        try {
            const { id } = req.params;
            const numRemoved = await Suggestion.delete(id);
            if (numRemoved === 0) return res.status(404).json({ message: "Sugerencia no encontrada" });
            res.json({ message: "Sugerencia eliminada de NoSQL" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SuggestionController;
