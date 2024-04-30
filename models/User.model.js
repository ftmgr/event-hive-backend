const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the Book model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
    },
    userType: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      unique: true, // Ensure that the email / login user is unique
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    hobbies: {
      type: [String],
    },
    organizedEvents: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    },
    attendedEvents: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const User = model('User', userSchema)

module.exports = User
