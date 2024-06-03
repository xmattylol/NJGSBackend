import appModule from "./backend_with_db.js";
import supertest from "supertest";
import database from "./database.js";
// const mongoose = require("mongoose");
import UserSchema from "./models/user.js";
import userServices from "./models/user-services.js";

/**
 * This is an example of API Testing.
 * This example demonstrates three strategies for testing API endpoints:
 * 1) Connecting to an actual database based on the URL in a env variable.
 *
 * Libraries used besides jest:
 *  Supertest: for making calls to your API endpoints.
 *
 */

let userModel;

let mongoServer;

async function connectToClouDbHelper() {
  try {
    appModule.setDatabaseConn(await database.connect());
  } catch (error) {
    console.log(error);
  }
}

beforeAll(async () => {
  // Three set up options:

  /**
   *  Use the following set up when utilizing the
   *  database.js module to connect to an actual DB.
   */
  await connectToClouDbHelper();
});

afterAll(async () => {
  await database.disconnect();
});

beforeEach(async () => {});

afterEach(async () => {});

test("Check that app is running", async () => {
  const result = await supertest(appModule.app).get("/").expect(200);
  console.log("App Check", result.body);
  expect(result.body).toBe("Hello World!");
});

test("Add users", async () => {
  const user1 = {
    name: "Ted Lasso",
    job: "Soccer coach",
  };

  await userServices.addUser(user1);

  const user2 = {
    name: "Ted Lasso",
    job: "Football coach",
  };

  await userServices.addUser(user2);

  const result = await supertest(appModule.app).get("/users").expect(200);

  expect(result.body).toHaveProperty("users_list");
  expect(result.body.users_list.length).toBeGreaterThanOrEqual(0);
});

test("Fetching users by name", async () => {
  const name = "Ted Lasso";
  const result = await supertest(appModule.app)
    .get("/users?name=" + name)
    .expect(200);
  expect(result.body).toHaveProperty("users_list");
  expect(result.body.users_list.length).toBeGreaterThan(0);
  result.body.users_list.forEach((user) => expect(user.name).toBe(name));

  //If using option (1)
  // Mock-related assertions
  //The mocked function (mongoose find) should be called only once
  // expect(userModel.find.mock.calls.length).toBe(1);
  // and should be called with no params
  // expect(userModel.find).toHaveBeenCalledWith({ name: name });
});

test("Fetching users by job", async () => {
  const result = [
    {
      name: "Pepe Guardiola",
      job: "Soccer coach",
    },
    {
      name: "Ted Lasso",
      job: "Soccer coach",
    },
  ];
  // userModel.find = jest.fn().mockResolvedValue(result);

  const userJob = "Soccer coach";

  const response = await supertest(appModule.app)
    .get("/users?job=" + userJob)
    .expect(200);

  expect(response.body).toHaveProperty("users_list");
  expect(response.body.users_list.length).toBeGreaterThanOrEqual(0);
  response.body.users_list.forEach((user) => expect(user.job).toBe(userJob));

  // expect(userModel.find.mock.calls.length).toBe(1);
  // expect(userModel.find).toHaveBeenCalledWith({ job: userJob });
});

test("Fetching by id and finding", async () => {
  // for this test, make sure the id in the query below matches the first
  // user in the database
  // userModel.findById = jest.fn().mockResolvedValue(dummyUser);
  const testUser = {
    _id: "661da68ac10868bcf1757a82",
    name: "Ted Lasso",
    job: "Soccer coach",
  };

  const response = await supertest(appModule.app)
    .get("/users/661da68ac10868bcf1757a82")
    .expect(200);

  console.log(response);
  expect(response.body).toHaveProperty("users_list");

  const found = response.body.users_list;
  expect(found._id).toBe(testUser._id);
  expect(found.name).toBe(testUser.name);
  expect(found.job).toBe(testUser.job);

  // expect(userModel.findById.mock.calls.length).toBe(1);
  // expect(userModel.findById).toHaveBeenCalledWith("007");
});

test("Adding user -- failure path with invalid job length", async () => {
  const toBeAdded = {
    name: "Harry Potter",
    job: "Y",
  };

  // mockingoose(userModel).toReturn({}, "save");

  const response = await supertest(appModule.app)
    .post("/users")
    .send(toBeAdded)
    .set("Accept", "application/json")
    .expect(400);

  expect(response.body).toMatchObject({});
});

// WARNING: If connected to a real db, this will add a document to it.
test("Adding user -- successful path", async () => {
  const addedUser = {
    _id: "some id...",
    name: "Harry Potter",
    job: "Young wizard",
  };
  const toBeAdded = {
    name: "Harry Potter",
    job: "Young wizard",
  };
  //Using mockingoose
  // mockingoose(userModel).toReturn(addedUser, "save");

  const response = await supertest(appModule.app)
    .post("/users")
    .send(toBeAdded)
    .set("Accept", "application/json")
    .expect("Content-type", /json/)
    .expect(201);

  expect(response.body).toBeTruthy();
  expect(response.body.name).toBe(toBeAdded.name);
  expect(response.body.job).toBe(toBeAdded.job);
  expect(response.body).toHaveProperty("_id");
});