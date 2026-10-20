import { describe, it, expect, vi, beforeEach } from 'vitest';
// Importamos los nombres reales de tus funciones
import { validateExpense, validateExpenseStatus } from '../../validations/sostenibilidad.validation.js';

describe('Pruebas Unitarias: Sostenibilidad Validations', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    next = vi.fn();
  });

  describe('Función: validateExpense', () => {
    it('1. Debería llamar a next() si casaId, monto y descripcion son válidos', () => {
      req.body = { casaId: 10, monto: 50000, descripcion: 'Compra de víveres' };
      validateExpense(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('2. Debería fallar (400) si casaId falta o no es un número', () => {
      req.body = { monto: 50000, descripcion: 'Compra de víveres' }; // Falta casaId
      validateExpense(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'casaId es requerido y debe ser un número' });
      expect(next).not.toHaveBeenCalled();
    });

    it('3. Debería fallar (400) si el monto es 0 o negativo', () => {
      req.body = { casaId: 10, monto: -500, descripcion: 'Compra de víveres' };
      validateExpense(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'monto es requerido y debe ser un número mayor a 0' });
      expect(next).not.toHaveBeenCalled();
    });

    it('4. Debería fallar (400) si la descripción está vacía', () => {
      req.body = { casaId: 10, monto: 50000, descripcion: '   ' };
      validateExpense(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'descripcion es requerida y no puede estar vacía' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Función: validateExpenseStatus', () => {
    it('5. Debería llamar a next() si el estado es APROBADO o RECHAZADO', () => {
      req.body = { estado: 'APROBADO' };
      validateExpenseStatus(req, res, next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('6. Debería fallar (400) si el estado es inválido (ej. PENDIENTE)', () => {
      req.body = { estado: 'PENDIENTE' };
      validateExpenseStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Estado inválido. Use APROBADO o RECHAZADO' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});