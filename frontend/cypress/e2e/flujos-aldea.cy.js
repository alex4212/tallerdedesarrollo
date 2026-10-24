describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/')
  });

  it('sostenibilidad.cy.js', function() {
    cy.visit('sostenibilidad.cy.js')
    
  });
})