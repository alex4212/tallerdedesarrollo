import { describe, it, expect, vi, beforeEach } from 'vitest';
// Importamos los nombres reales de tus funciones
import { validateTask, validateTaskStatus } from '../../validations/mantenimiento.validation.js';

describe('Pruebas Unitarias: Mantenimiento Validations', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    next = vi.fn();
  });

  describe('Función: validateTask', () => {
    it('1. Debería llamar a next() si casaId (número) y descripcion (string) son válidos', () => {
      req.body = { casaId: 5, descripcion: 'Reparación de filtración en el techo' }; 
      validateTask(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('2. Debería fallar (400) si casaId falta o no es un número', () => {
      req.body = { casaId: 'cinco', descripcion: 'Reparación de filtración' }; // string en vez de número
      validateTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'casaId es requerido y debe ser un número' });
      expect(next).not.toHaveBeenCalled();
    });

    it('3. Debería fallar (400) si la descripción está vacía o es solo espacios', () => {
      req.body = { casaId: 5, descripcion: '   ' }; 
      validateTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'descripcion es requerida y no puede estar vacía' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Función: validateTaskStatus', () => {
    it('4. Debería llamar a next() si el estado es un string válido', () => {
      req.body = { estado: 'Completado' };
      validateTaskStatus(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });
});