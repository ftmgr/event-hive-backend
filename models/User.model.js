const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      unique: true,
    },
    userType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required."],
    },
    info: {
      // Grouped additional user details in an object
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      hobbies: {
        type: [String],
      },
      age: {
        type: Number,
      },
      language: {
        type: [String], // Assuming a user can speak multiple languages
      },
    },
    favoritedEvents: {
      // Added favorited events
      type: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const User = model("User", userSchema);

module.exports = User;
