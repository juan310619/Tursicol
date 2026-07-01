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
            status: 'pending',
            createdAt: new Date()
        };
        return await db.insert(newSuggestion);
    }

    static async findAll() {
        return await db.find({}).sort({ createdAt: -1 });
    }

    static async findApproved() {
        const all = await db.find({}).sort({ createdAt: -1 });
        return all.filter(s => s.status !== 'pending');
    }

    static async findByUserId(user_id) {
        return await db.find({ user_id });
    }

    static async update(id, data) {
        const updateFields = {};
        if (data.nombre_lugar !== undefined) updateFields.nombre_lugar = data.nombre_lugar;
        if (data.ubicacion !== undefined) updateFields.ubicacion = data.ubicacion;
        if (data.descripcion !== undefined) updateFields.descripcion = data.descripcion;
        if (data.status !== undefined) updateFields.status = data.status;
        updateFields.updatedAt = new Date();
        return await db.update(
            { _id: id },
            { $set: updateFields }
        );
    }

    static async delete(id) {
        return await db.remove({ _id: id });
    }
}

module.exports = Suggestion;
