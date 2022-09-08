describe("ch.colabproject.colab.tests.e2e.Chaos", () => {
  beforeEach(() => {
    cy.visitColab();
  });

  it("SignInNoChaos", () => {
    // first get the password field to make sure the page has been fully loaded
    cy.get("input[type=password]").should("have.length", "1");
    // then assert there is no monkies
    cy.get("svg.chaos-monkey").should("have.length", "0");
  });
});
