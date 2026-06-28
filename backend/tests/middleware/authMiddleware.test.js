process.env.JWT_SECRET = 'test-secret-for-jwt';

const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../../src/middleware/authMiddleware');

describe('AuthMiddleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = { headers: {} };
        mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockNext = jest.fn();
    });

    describe('verifyToken', () => {
        test('Token válido llama a next()', () => {
            mockReq.headers['authorization'] = 'Bearer ' + jwt.sign(
                { id: 1, email: 't@t.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30m' });
            verifyToken(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user.id).toBe(1);
        });

        test('Sin cabecera retorna 403', () => {
            verifyToken(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('Token expirado retorna 401', () => {
            mockReq.headers['authorization'] = 'Bearer ' + jwt.sign(
                { id: 1 }, process.env.JWT_SECRET, { expiresIn: '0s' });
            verifyToken(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        test('Cabecera sin Bearer retorna 403', () => {
            mockReq.headers['authorization'] = 'token-sin-bearer';
            verifyToken(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });

    describe('verifyAdmin', () => {
        test('Usuario admin llama a next()', () => {
            mockReq.headers['authorization'] = 'Bearer ' + jwt.sign(
                { id: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30m' });
            verifyAdmin(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        test('Usuario normal retorna 403', () => {
            mockReq.headers['authorization'] = 'Bearer ' + jwt.sign(
                { id: 2, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30m' });
            verifyAdmin(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
});
