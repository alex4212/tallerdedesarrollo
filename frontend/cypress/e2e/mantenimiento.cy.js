describe('Pruebas E2E: Módulo de Mantenimiento', () => {
  const baseUrl = 'http://localhost:5173';
  const emailAdmin = 'Ivresse.jorquera@aldeasinfantiles.cl';
  const passAdmin = 'Ivresse Jorquera';

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });

  it('Flujo completo: Iniciar sesión, crear tarea de mantenimiento, marcar como completada y eliminarla', () => {
    // 1. Iniciar sesión
    cy.get('input[type="email"]').clear().type(emailAdmin);
    cy.get('input[type="password"]').clear().type(passAdmin);
    cy.get('button[type="submit"]').click();

    // Comprobar que entramos al sistema
    cy.url().should('not.include', '/login');

    // 2. Interceptar llamadas API del módulo
    cy.intercept('POST', '**/api/mantenimiento/tareas').as('crearTarea');
    cy.intercept('PATCH', '**/api/mantenimiento/tareas/*/estado').as('completarTarea');
    cy.intercept('DELETE', '**/api/mantenimiento/tareas/*').as('eliminarTarea');

    // 3. Navegar al Módulo de Mantenimiento desde el menú lateral
    cy.contains('Mantenimiento').should('be.visible').click();
    cy.contains('Gestión de Mantenimiento').should('be.visible');

    // 4. Abrir el modal "Nueva Tarea"
    cy.contains('button', 'Nueva Tarea').should('be.visible').click();
    cy.contains('Nueva Tarea de Mantenimiento').should('be.visible');

    // 5. Completar el formulario
    const descripcionTarea = `Revisión eléctrica y cambio de enchufes - Test ${Date.now()}`;
    const manana = new Date();
    manana.setDate(manana.getDate() + 3);
    const fechaLimite = manana.toISOString().split('T')[0];

    // Seleccionar la Casa 1
    cy.contains('Casa Asignada')
      .parent()
      .find('select')
      .select('1');

    // Seleccionar Tipo de Mantenimiento (Correctivo)
    cy.contains('Tipo de Mantenimiento')
      .parent()
      .find('select')
      .select('CORRECTIVO');

    // Ingresar Fecha Límite
    cy.get('input[type="date"]').clear().type(fechaLimite);

    // Ingresar Descripción
    cy.get('input[placeholder="Ej: Reparación de cerradura y bisagras de puerta principal"]')
      .clear()
      .type(descripcionTarea);

    // 6. Guardar la nueva tarea
    cy.contains('button', 'Crear Tarea').click();

    // 7. Validar respuesta de creación y verificar en la lista
    cy.wait('@crearTarea').its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.contains(descripcionTarea).should('be.visible');

    // 8. Marcar la tarea como completada
    cy.contains(descripcionTarea)
      .parents('.list-item')
      .find('button[title="Marcar como Completada"]')
      .click();

    cy.wait('@completarTarea').its('response.statusCode').should('be.oneOf', [200, 201]);

    // Verificar que el badge de la tarea ahora indica COMPLETADA
    cy.contains(descripcionTarea)
      .parents('.list-item')
      .contains('COMPLETADA')
      .should('be.visible');

    // 9. Filtrar en el buscador para comprobar búsqueda reactiva
    cy.get('input[placeholder="Buscar por descripción o casa..."]')
      .clear()
      .type(descripcionTarea);
    cy.contains(descripcionTarea).should('be.visible');

    // 10. Eliminar la tarea
    cy.contains(descripcionTarea)
      .parents('.list-item')
      .find('button[title="Eliminar tarea"]')
      .click();

    // Confirmar en el modal de eliminación
    cy.contains('Confirmar Eliminación').should('be.visible');
    cy.contains('button', 'Eliminar Tarea').click();

    cy.wait('@eliminarTarea').its('response.statusCode').should('be.oneOf', [200, 204]);

    // Verificar que la tarea ya no figura en pantalla
    cy.contains(descripcionTarea).should('not.exist');
  });
});
