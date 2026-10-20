import { describe, it, expect, vi, beforeEach } from 'vitest';
// Ajusta esta ruta dependiendo de dónde esté tu archivo exacto
import { validateRut } from '../../validations/acogida.validation.js';

describe('Pruebas Unitarias: validateRut (Middleware)', () => {
  let req, res, next;

  // beforeEach se ejecuta antes de cada 'it', limpiando las variables
  beforeEach(() => {
    // 1. Simulamos el request (req)
    req = {
      body: {}
    };

    // 2. Simulamos el response (res) permitiendo encadenar res.status().json()
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    // 3. Simulamos la función next()
    next = vi.fn();
  });

  it('1. Debería llamar a next() si el RUT es totalmente válido', () => {
    // RUT válido de ejemplo real (12.345.678-5)
    req.body.rut = '12345678-5'; 

    validateRut(req, res, next);

    // Verificamos que dejó pasar la solicitud y no devolvió errores
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('2. Debería fallar (400) si el RUT no viene en el body', () => {
    req.body = {}; // Body vacío

    validateRut(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'El RUT es obligatorio' });
    expect(next).not.toHaveBeenCalled();
  });

  it('3. Debería fallar (400) si el RUT tiene un formato inválido (ej. letras)', () => {
    req.body.rut = 'ABCDEFG'; 

    validateRut(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'El RUT ingresado no es válido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('4. Debería fallar (400) si el dígito verificador es incorrecto', () => {
    req.body.rut = '12345678-9'; // El DV real debería ser 5, le pasamos 9

    validateRut(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'El dígito verificador del RUT es incorrecto' });
    expect(next).not.toHaveBeenCalled();
  });
});