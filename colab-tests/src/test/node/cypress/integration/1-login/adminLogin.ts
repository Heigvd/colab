describe("ch.colabproject.colab.tests.e2e.Login", () => {
  beforeEach(() => {
    cy.visitWegas();
    cy.waitForReact();
  });

  it("LoginAsAdminAndLogout", () => {
    //    cy.react("Input").should("have.length", "2");
    //
    //    cy.react("Input").get("input[type=text]").should("have.length", "1").type(Cypress.env("ADMIN_USERNAME"));
    //    cy.react("Input").get("input[type=password]").should("have.length", "1").type(Cypress.env("ADMIN_PASSWORD"));
    //
    //    cy.react("Button").should("have.length", "1").click();
    cy.login(Cypress.env("ADMIN_USERNAME"), Cypress.env("ADMIN_PASSWORD"));


    cy.get("svg.fa-circle-user")
      .should("have.length", "1")
      .click();

    cy.get("svg.fa-right-from-bracket")
      .should("have.length", "1")
      .click();

    cy.react("Input").get("input[type=password]").should("have.length", "1");

    //
    //    cy.react("FontAwesomeIcon", {
    //      props: {
    //        icon: {
    //          iconName: 'sign-out-alt'
    //        }
    //      },
    //      options: {timeout: 5000}
    //    })
    //    .should('have.length', '1')
    //    .click();

    //cy.react("Notification", {options: {timeout: 5000}}).should("have.length", 1).should("have.text", "Authentication failed");
  });
});
