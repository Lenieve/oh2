const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/authMiddleware.js');
process.env.JWT_SECRET = 'your_jwt_secret_for_testing';

describe('authenticateJWT', () => {
  it('should return 401 if no token is provided', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    authMiddleware.authenticateJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Zugriff verweigert. Kein Token vorhanden.');
  });



  it('should return 403 if an invalid or expired token is provided', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    jwt.verify = jest.fn((token, secret, callback) => {
      callback(new Error('invalid token'));
    });

    authMiddleware.authenticateJWT(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET, expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Ungültiger oder abgelaufener Token.');
  });

  it('should set req.user and call next if a valid token is provided', () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    jwt.verify = jest.fn((token, secret, callback) => {
      callback(null, { data: { id: 1, role: 'admin' } });
    });

    authMiddleware.authenticateJWT(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET, expect.any(Function));
    expect(req.user).toEqual({ id: 1, role: 'admin' });
    expect(next).toHaveBeenCalled();
  });
});

describe('authorizeRole', () => {
  it('should return 401 if user is not authenticated', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    authMiddleware.authorizeRole(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Nicht authentifiziert.');
  });

  it('should return 403 if user does not have the required role', () => {
    const req = { user: { id: 1, role: 'user' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    authMiddleware.authorizeRole(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Zugriff verweigert. Sie haben nicht die erforderliche Rolle.');
  });

  it('should call next if user has the required role', () => {
    const req = { user: { id: 1, role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();

    authMiddleware.authorizeRole(['admin'])(req, res, next);

    expect(next).toHaveBeenCalled();
  });
  
  it('should return 403 for malformed token', () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt-token' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();
  
    jwt.verify = jest.fn((token, secret, callback) => {
      callback(new Error('invalid token'));
    });
  
    authMiddleware.authenticateJWT(req, res, next);
  
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Ungültiger oder abgelaufener Token.');
  });

  it('should return 403 for empty string token', () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();
  
    authMiddleware.authenticateJWT(req, res, next);
  
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Ungültiger oder abgelaufener Token.');
  });

  
  it('should return 403 for non-JWT string as token', () => {
    const req = { headers: { authorization: 'Bearer randomstring' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();
  
    jwt.verify = jest.fn((token, secret, callback) => {
      callback(new Error('invalid token'));
    });
  
    authMiddleware.authenticateJWT(req, res, next);
  
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Ungültiger oder abgelaufener Token.');
  });
  
});