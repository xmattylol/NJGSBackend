import mongoose from "mongoose";
import UserSchema from "./user.js";
import dotenv from "dotenv";
dotenv.config();

let dbConnection;

function getDbConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return dbConnection;
}

async function getUsers(name, Classes) {
  const userModel = getDbConnection().model("User", UserSchema);
  let result;
  if (name === undefined && Classes === undefined) {
    result = await userModel.find();
  } else if (name && Classes === undefined) {
    result = await findUserByName(name);
  } else if (Classes && name === undefined) {
    result = await findUserByClasses(Classes);
  } else {
    result = await findUserByNameAndClasses(name, Classes);
  }
  return result;
}

async function findUserById(id) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    return await userModel.findById(id);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function addUser(user) {
  // userModel is a Model, a subclass of mongoose.Model
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const userToAdd = new userModel(user);
    const savedUser = await userToAdd.save();
    return savedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function findUserByName(name) {
  const userModel = getDbConnection().model("User", UserSchema);
  return await userModel.find({ name: name });
}

async function findUserByClasses(Classes) {
  const userModel = getDbConnection().model("User", UserSchema);
  return await userModel.find({ Classes: Classes });
}

async function deleteUserById(id) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const deletedUser = await userModel.findByIdAndDelete(id);
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    return null;
  }
}

export default {
  getUsers,
  findUserById,
  addUser,
  deleteUserById, 
};
