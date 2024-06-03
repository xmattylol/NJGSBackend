/**
 * Feature: Backend (REST API) is listening
 * Scenario: Backend loads and runs successfully
 *    GIVEN I run the backend
 *    WHEN I visit the root endpoint
 *    THEN it does not smoke
 *    AND returns "Hello World!"
 *    AND the response code is 200
 */

// todo - use process.env.BACKEND_URL
const BACKEND_URL = "http://localhost:8000";

describe("Backend (REST API) is listening", () => {
  context("Backend loads and runs successfully", () => {
    before(() => {
      //this is a beforeAll
      //if needed
      //see more here: https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Hooks
    });

    it("GIVEN I run the backend", () => {});

    it("WHEN I visit the root endpoint", () => {
      cy.request(`${BACKEND_URL}`).then((response) => {
        //Using matchers from Chai: https://www.chaijs.com/guide/styles/#assert
        //All Cypress supported matchers here: https://docs.cypress.io/guides/references/assertions
        assert.isNotNull(response.body, "THEN it does not smoke");
        assert.equal(
          response.body,
          "Hello World!",
          'AND returns "Hello World!'
        );
        assert.equal(response.status, 200, "AND the response code is 200");

        //OR use another set of supported matchers from Chai, the Expect style:
        //https://www.chaijs.com/guide/styles/#expect
        // expect(response.body).to.be.a('string');
        // expect(response.body).to.equal('Hello World!');
        // expect(response.status).to.equal(200);
      });
    });
  });
});

/**
 * Feature: API takes an obj and adds it to the DB
 *  As an API client I want to be able to send a user object to be added to
 *  the database.
 *
 * Scenario: Successfull post
 *    GIVEN My user object has valid fields (user and job)
 *    WHEN I attempt to post the user obj
 *    THEN I receive a successfull response (code 201)
 *    AND the response object contains the property _id
 *    AND the response object contains the same name and job I passed
 *
 * Scenario: Unsuccessfull post
 *    GIVEN My user object has an invalid field (job)
 *    WHEN I attempt to post the user obj
 *    THEN I receive a failure response (code 400)
 *    AND there's no response obj
 */

describe("API takes an obj and adds it to the DB", () => {
  context("Successfull post", () => {
    before(() => {});

    let user = {};

    it("GIVEN My user object has valid fields (user and classes)", () => {
      user = {
        name: "Pamela",
        Classes: "CSC 430",
      };
    });

    it("WHEN I attempt to post the user obj", () => {
      cy.request("POST", `${BACKEND_URL}/users`, user).then((response) => {
        //Using matchers from Chai: https://www.chaijs.com/guide/styles/#assert
        // All Cypress supported matchers here: https://docs.cypress.io/guides/references/assertions
        assert.equal(
          response.status,
          201,
          "THEN I receive a successfull response (code 201)"
        );
        assert.exists(
          response.body._id,
          "AND the response object contains the property _id"
        );
        assert.equal(
          response.body.name,
          user.name,
          "AND the response object contains the same name and Class I passed"
        );
        assert.equal(
          response.body.Classes,
          user.Classes,
          "AND the response object contains the same name and Class I passed"
        );
      });
    });
  });

  context("Unsuccessfull post", () => {
    before(() => {});

    let user = {};

    it("GIVEN My user object has an invalid field (Classes)", () => {
      user = {
        name: "Leah",
        Classes: "S",
      };
    });

    it("WHEN I attempt to post the user obj", () => {
      cy.request({
        method: "POST",
        url: `${BACKEND_URL}/users`,
        body: user,
        failOnStatusCode: false,
      }).then((response) => {
        //Using matchers from Chai: https://www.chaijs.com/guide/styles/#assert
        //All Cypress supported matchers here: https://docs.cypress.io/guides/references/assertions
        assert.equal(
          response.status,
          400,
          "THEN I receive a failure response (code 400)"
        );
        assert.notExists(response.body, "AND there's no response obj");
      });
    });
  });
});