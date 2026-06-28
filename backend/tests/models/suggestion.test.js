const mockDb = {
    insert: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

jest.mock('nedb-promises', () => {
    const MockDatastore = function() {};
    MockDatastore.create = jest.fn(() => mockDb);
    return MockDatastore;
});

const Suggestion = require('../../src/models/Suggestion');

describe('Modelo Suggestion (NeDB)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Crear sugerencia con datos completos', async () => {
        const mockDoc = {
            _id: 'abc123',
            user_id: 1,
            nombre_lugar: 'Parque Tayrona',
            ubicacion: 'Magdalena',
            descripcion: 'Hermoso parque natural',
            createdAt: new Date(),
        };
        mockDb.insert.mockResolvedValue(mockDoc);

        const doc = await Suggestion.create(1, 'Parque Tayrona', 'Magdalena', 'Hermoso parque natural');
        expect(doc._id).toBeDefined();
        expect(doc.nombre_lugar).toBe('Parque Tayrona');
        expect(doc.createdAt instanceof Date).toBe(true);
        expect(mockDb.insert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 1,
            nombre_lugar: 'Parque Tayrona',
        }));
    });

    test('Obtener todas ordenadas por fecha descendente', async () => {
        const mockDocs = [
            { _id: '1', user_id: 2, nombre_lugar: 'B', createdAt: new Date('2026-06-02') },
            { _id: '2', user_id: 1, nombre_lugar: 'A', createdAt: new Date('2026-06-01') },
        ];
        mockDb.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockDocs),
        });

        const all = await Suggestion.findAll();
        expect(all.length).toBeGreaterThanOrEqual(2);
        for (let i = 1; i < all.length; i++)
            expect(all[i - 1].createdAt >= all[i].createdAt).toBe(true);
        expect(mockDb.find).toHaveBeenCalledWith({});
    });

    test('Actualizar y eliminar sugerencias', async () => {
        mockDb.update.mockResolvedValue(1);
        mockDb.remove.mockResolvedValue(1);

        expect(await Suggestion.update('id1', { nombre_lugar: 'Actualizado' })).toBe(1);
        expect(mockDb.update).toHaveBeenCalled();

        expect(await Suggestion.delete('id1')).toBe(1);
        expect(mockDb.remove).toHaveBeenCalledWith({ _id: 'id1' });

        mockDb.remove.mockResolvedValue(0);
        expect(await Suggestion.delete('id_inexistente')).toBe(0);
    });
});
