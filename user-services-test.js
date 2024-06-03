// user-services.test.js
import mongoose from "mongoose";
import UserSchema from "./models/user.js";
import userServices from "./models/user-services.js";

jest.mock("mongoose", () => ({
  createConnection: jest.fn().mockReturnValue({
    model: jest.fn().mockReturnValue({
      find: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      findByIdAndDelete: jest.fn(),
    }),
  }),
}));

describe("User Services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get all users when no name and Classes are provided", async () => {
    const mockUsers = [{ name: "User 1" }, { name: "User 2" }];
    mongoose.createConnection().model().find.mockResolvedValue(mockUsers);

    const result = await userServices.getUsers();

    expect(mongoose.createConnection().model().find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUsers);
  });

  it("should find a user by ID", async () => {
    const mockUser = { _id: "user123", name: "User 1" };
    mongoose.createConnection().model().findById.mockResolvedValue(mockUser);

    const result = await userServices.findUserById("user123");

    expect(mongoose.createConnection().model().findById).toHaveBeenCalledWith("user123");
    expect(result).toEqual(mockUser);
  });

  it("should add a new user", async () => {
    const mockUser = { name: "New User", Classes: "Class 1" };
    const mockSavedUser = { _id: "newUser123", ...mockUser };
    mongoose.createConnection().model().mockReturnValue({
      save: jest.fn().mockResolvedValue(mockSavedUser),
    });

    const result = await userServices.addUser(mockUser);

    expect(mongoose.createConnection().model().save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSavedUser);
  });

  it("should delete a user by ID", async () => {
    const mockDeletedUser = { _id: "user123", name: "User 1" };
    mongoose.createConnection().model().findByIdAndDelete.mockResolvedValue(mockDeletedUser);

    const result = await userServices.deleteUserById("user123");

    expect(mongoose.createConnection().model().findByIdAndDelete).toHaveBeenCalledWith("user123");
    expect(result).toEqual(mockDeletedUser);
  });
});