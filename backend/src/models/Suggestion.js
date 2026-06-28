const Datastore = require('nedb-promises');
const path = require('path');

// Almacenamos el archivo NoSQL en la carpeta config
const dbPath = path.resolve(__dirname, '../../config/suggestions.db');
const db = Datastore.create(dbPath);

class Suggestion {
    static async create(user_id, nombre_lugar, ubicacion, descripcion) {
        const newSuggestion = {
            user_id,
            nombre_lugar,
            ubicacion,
            descripcion,
            createdAt: new Date()
        };
        return await db.insert(newSuggestion);
    }

    static async findAll() {
        return await db.find({}).sort({ createdAt: -1 });
    }

    static async findByUserId(user_id) {
        return await db.find({ user_id });
    }

    static async update(id, data) {
        const { nombre_lugar, ubicacion, descripcion } = data;
        return await db.update(
            { _id: id },
            { $set: { nombre_lugar, ubicacion, descripcion, updatedAt: new Date() } }
        );
    }

    static async delete(id) {
        return await db.remove({ _id: id });
    }
}

module.exports = Suggestion;
