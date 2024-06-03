import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    Classes: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 2) throw new Error("Invalid job.");
      },
    },
    RoomNumbers: {
      type: String,
      trim: true,
    },
  },
  { collection: "users_list" }
);

export default UserSchema;
