// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("visitWegas", () => {
  const url = Cypress.env("WEGAS_URL");
  if (url) {
    cy.visit(url);
  } else {
    throw "please set env WEGAS_URL to the test url";
  }
});

Cypress.Commands.add("login", (identifier, password) => {
  cy.react("Input").should("have.length", "2");

  cy.react("Input")
    .get("input[type=text]")
    .should("have.length", "1")
    .type(identifier);
  cy.react("Input")
    .get("input[type=password]")
    .should("have.length", "1")
    .type(password);

  cy.react("ButtonWithLoader").should("have.length", "1").click();
});

Cypress.Commands.add("logout", (identifier, password) => {
  cy.react("IconButton", { props: { icon: { iconName: "sign-out-alt" } } })
    .should("have.length", "1")
    .click();
});
