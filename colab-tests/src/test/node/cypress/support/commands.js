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

Cypress.Commands.add("visitColab", () => {
  const url = Cypress.env("COLAB_URL");
  if (url) {
    cy.visit(url);
    cy.waitForReact(5000, "#root");
  } else {
    throw "please set env COLAB_URL to the test url";
  }
});

Cypress.Commands.add("login", (identifier, password) => {
  /* cypress react-selector fails with react 18...*/
  //  cy.react("Input").should("have.length", "2");
  //
  //  cy.react("Input")
  //    .get("input[type=text]")
  //    .should("have.length", "1")
  //    .type(identifier);
  //  cy.react("Input")
  //    .get("input[type=password]")
  //    .should("have.length", "1")
  //    .type(password);
  //  cy.react("ButtonWithLoader").should("have.length", "1").click();

  cy.get("input", { options: { timeout: 50000 } }).should("have.length", "2");

  cy.get("input[type=text]").should("have.length", "1").type(identifier);
  cy.get("input[type=password]").should("have.length", "1").type(password);

  cy.contains("Login").should("have.length", "1").click();
});

Cypress.Commands.add("logout", (initials) => {
  cy.get(".user-dropdown").contains(initials).should("have.length", "1").click();

  cy.get("span").contains("logout").should("have.length", "1").click();
  //  cy.react("IconButton", { props: { icon: { iconName: "sign-out-alt" } } })
  //    .should("have.length", "1")
  //    .click();
});
