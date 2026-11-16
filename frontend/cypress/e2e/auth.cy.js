describe('Pruebas E2E: Autenticación, Seguridad y Navegación entre Módulos', () => {
  const baseUrl = 'http://localhost:5173';
  const emailValido = 'Ivresse.jorquera@aldeasinfantiles.cl';
  const passValida = 'Ivresse Jorquera';

  it('Flujo completo: Protección de rutas, validación de credenciales, navegación y cierre de sesión', () => {
    cy.visit(`${baseUrl}/dashboard/acogida`);
    cy.wait(1000);
    cy.url().should('include', '/login');

    cy.get('input[type="email"]').clear().type('correo.invalido@aldeasinfantiles.cl');
    cy.wait(800);
    cy.get('input[type="password"]').clear().type('ClaveIncorrecta123');
    cy.wait(800);
    cy.get('button[type="submit"]').click();

    cy.get('.error-msg', { timeout: 8000 }).should('be.visible').and('contain', 'Credenciales');
    cy.url().should('include', '/login');
    cy.wait(1200);

    cy.intercept('POST', '**/api/auth/login').as('loginReq');

    cy.get('input[type="email"]').clear().type(emailValido);
    cy.wait(800);
    cy.get('input[type="password"]').clear().type(passValida);
    cy.wait(800);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    cy.wait(1200);

    cy.url().should('include', '/dashboard/acogida');
    cy.contains('Ivresse Jorquera').should('be.visible');
    cy.contains('ADMIN').should('be.visible');

    cy.wait(1200);
    cy.contains('.nav-btn', 'Mantenimiento').should('be.visible').click();
    cy.contains('Gestión de Mantenimiento').should('be.visible');
    cy.url().should('include', '/dashboard/mantenimiento');

    cy.wait(1200);
    cy.contains('.nav-btn', 'Sostenibilidad').should('be.visible').click();
    cy.contains('Sostenibilidad y Gastos').should('be.visible');
    cy.url().should('include', '/dashboard/sostenibilidad');

    cy.wait(1200);
    cy.contains('.nav-btn', 'Niños / Acogida').should('be.visible').click();
    cy.contains('Gestión de Casas y Acogida').should('be.visible');
    cy.url().should('include', '/dashboard/acogida');

    cy.wait(1200);
    cy.contains('button', 'Cerrar Sesión').should('be.visible').click();
    cy.wait(1200);

    cy.url().should('include', '/login');
    cy.window().then(win => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });

    cy.visit(`${baseUrl}/dashboard/acogida`);
    cy.wait(1000);
    cy.url().should('include', '/login');
  });
});
