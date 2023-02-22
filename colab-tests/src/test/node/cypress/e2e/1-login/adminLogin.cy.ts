describe("ch.colabproject.colab.tests.e2e.Login", () => {
  beforeEach(() => {
    cy.visitColab();
  });

  it("LoginAsAdminAndLogout", () => {
    cy.login(Cypress.env("ADMIN_USERNAME"), Cypress.env("ADMIN_PASSWORD"));

    cy.logout(Cypress.env("ADMIN_INITIALS"));
    cy.get("input[type=password]").should("have.length", "1");

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
