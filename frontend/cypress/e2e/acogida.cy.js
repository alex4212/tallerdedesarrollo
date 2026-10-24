describe('Pruebas E2E: Módulo de Acogida', () => {
  
  const baseUrl = 'http://localhost:5173';
  const emailAdmin = 'Ivresse.jorquera@aldeasinfantiles.cl';
  const passAdmin = 'Ivresse Jorquera';

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });

  it('Flujo 1: Iniciar sesión y registrar a un menor', () => {
    // 1. Iniciar Sesión
    cy.get('input[type="email"]').type("Ivresse.jorquera@aldeasinfantiles.cl");
    cy.get('input[type="password"]').type("Ivresse Jorquera");
    cy.get('button[type="submit"]').click();

    // Comprobar que entramos al sistema
    cy.url().should('not.include', '/login');

    // 2. Ir al Módulo de Acogida 
    cy.contains('Acogida').click(); 
    
    // 3. Llenar el formulario de ingreso del niño
    cy.get('input[name="rut"]').type('12345678-5');
    cy.get('input[name="nombre"]').type('Ana López'); 
    cy.get('input[name="edad"]').type('12');
    
    // 4. Enviar Formulario
    cy.get('button[type="submit"]').contains('Guardar').click(); 
    
    // 5. Validar éxito (descomentar y ajustar según tu frontend)
    // cy.contains('registrado con éxito').should('be.visible'); 
  });
});