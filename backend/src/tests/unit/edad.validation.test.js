import { describe, it, expect, vi, beforeEach } from 'vitest';
// Ajusta la ruta y el nombre del archivo donde tengas esta función
import { validarEdadNino } from '../../validations/acogida.validation.js';

describe('Pruebas Unitarias: validarEdadNino (Aldeas Infantiles SOS)', () => {
  let req, res, next;

  beforeEach(() => {
    // Reiniciamos los mocks de Express antes de cada test
    req = { body: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    next = vi.fn();
  });

  it('1. Debería llamar a next() si la edad es válida para un niño (ej. 12 años)', () => {
    req.body = { edad: 12 };
    validarEdadNino(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('2. Debería fallar (400) si no se incluye la edad en la solicitud', () => {
    req.body = {}; // Body vacío
    validarEdadNino(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'La edad es obligatoria' });
    expect(next).not.toHaveBeenCalled();
  });

  it('3. Debería fallar (400) si la edad enviada no es un formato numérico', () => {
    req.body = { edad: 'doce' }; // String en lugar de número
    validarEdadNino(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'La edad debe ser un número válido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('4. Debería fallar (400) si la edad es mayor a 18 años (fuera del programa regular)', () => {
    req.body = { edad: 19 }; // Edad no permitida en Aldeas SOS
    validarEdadNino(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'El programa de acogida es para menores de 18 años' });
    expect(next).not.toHaveBeenCalled();
  });
});