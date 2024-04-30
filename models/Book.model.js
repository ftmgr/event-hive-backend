const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the Book model to whatever makes sense in this case
const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required.'],
      trim: true,
    },
    pages: {
      type: Number,
      required: [true, 'Pages is required.'],
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Book = model('Book', bookSchema)

module.exports = Book
