describe('Pruebas E2E: Módulo de Acogida', () => {
  const baseUrl = 'http://localhost:5173';
  const emailAdmin = 'Ivresse.jorquera@aldeasinfantiles.cl';
  const passAdmin = 'Ivresse Jorquera';

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });

  it('Flujo 1: Iniciar sesión, registrar a un menor y asignarle casa', () => {
    // 1. Iniciar sesión
    cy.get('input[type="email"]').clear().type(emailAdmin);
    cy.get('input[type="password"]').clear().type(passAdmin);
    cy.get('button[type="submit"]').click();

    // Comprobar que entramos al sistema
    cy.url().should('not.include', '/login');

    // Interceptamos la creación del menor para sincronizar los tiempos
    cy.intercept('POST', '**/api/acogida/menores').as('crearMenor');

    // 2. Ir al Módulo de Acogida
    cy.contains('Acogida').click();

    // 3. Abrir el modal de registro usando el botón "Agregar"
    cy.contains('Agregar').should('be.visible').click();

    // 4. Llenar el formulario completo
    const rutNuevo = '12345678-5';
    const nombreMenor = 'Pedro Martínez';

    cy.get('input[placeholder="Ej: Juan Pérez"]').clear().type(nombreMenor);
    cy.get('input[placeholder="12.345.678-9"]').clear().type(rutNuevo);
    cy.get('input[placeholder="Ej: 8"]').clear().type('9');
    cy.get('input[placeholder="Ej: F-12345"]').clear().type('77788');

    // 5. Enviar Formulario
    cy.contains('button', 'Registrar Menor').click();

    // Esperamos que el backend guarde al menor exitosamente
    cy.wait('@crearMenor').its('response.statusCode').should('be.oneOf', [200, 201]);

    // 6. Clic en el botón general superior para abrir el modal "Asignar a Casa"
    cy.contains('button', 'Asignar Casa').should('be.visible').click();

    // 7. INTERACCIÓN CON EL NUEVO MODAL
    // Esperamos a que el título del modal sea visible
    cy.contains('Asignar a Casa').should('be.visible');

    // Seleccionamos al menor buscando la opción que contiene "Pedro Martínez"
    cy.contains('Seleccionar Menor')
      .parent()
      .find('select')
      .contains('option', nombreMenor)
      .then(opcion => {
        cy.contains('Seleccionar Menor').parent().find('select').select(opcion.val());
      });

    // Seleccionamos la Casa 3
    cy.contains('Seleccionar Casa')
      .parent()
      .find('select')
      .contains('option', 'Casa 3')
      .then(opcion => {
        cy.contains('Seleccionar Casa').parent().find('select').select(opcion.val());
      });

    // 8. Presionamos el botón azul de confirmación dentro del modal
    // .last() agarra el del modal, y { force: true } ignora cualquier bloqueo visual
    cy.get('button').contains('Asignar Casa').last().click({ force: true });
  });
});