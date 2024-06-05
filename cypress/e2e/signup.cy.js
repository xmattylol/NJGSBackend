describe("Signup Tests", () => {
  it("Should successfully sign up a new user", () => {
    cy.visit("http://localhost:3000/signup"); // Adjust the URL if necessary

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="pwd"]').type("testpassword");
    cy.get('input[name="pwdValidate"]').type("testpassword");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/users-table");
    cy.contains("Successfully signed up").should("be.visible");
  });

  it("Should show error for short password", () => {
    cy.visit("http://localhost:3000/signup");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="pwd"]').type("abc");
    cy.get('input[name="pwdValidate"]').type("abc");
    cy.get('button[type="submit"]').click();

    cy.contains("Password must be at least 3 characters long").should(
      "be.visible"
    );
  });
});
