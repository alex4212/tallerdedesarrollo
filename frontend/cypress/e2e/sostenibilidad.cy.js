describe('Pruebas E2E: Módulo de Sostenibilidad', () => {
  
  const baseUrl = 'http://localhost:5173';
  const emailAdmin = 'Ivresse.jorquera@aldeasinfantiles.cl';
  const passAdmin = 'Ivresse Jorquera';

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });

  it('Flujo 2: Iniciar sesión y registrar un gasto', () => {
    // 1. Iniciar Sesión (Requisito de la pauta)
    cy.get('input[type="email"]').type(emailAdmin);
    cy.get('input[type="password"]').type(passAdmin);
    cy.get('button[type="submit"]').click();

    // Comprobar que entramos al sistema
    cy.url().should('not.include', '/login');

    // 2. Ir al Módulo de Sostenibilidad
    cy.contains('Sostenibilidad').click(); 

    // 3. Llenar el formulario de gastos
    cy.get('input[name="casaId"]').type('3'); 
    cy.get('input[name="monto"]').type('50000');
    cy.get('input[name="descripcion"]').type('Compra de mercadería casa 3');
    
    cy.get('button[type="submit"]').contains('Guardar').click();
    
  });
});