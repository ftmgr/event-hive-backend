const { Schema, model } = require('mongoose')

// Comment schema
const commentSchema = new Schema(
    {
        commentText: {
            type: String,
            required: [true, 'Comment text is required.'],
            trim: true,
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required.']
        },
        commenter: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Commenter ID is required.']
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
)

const Comment = model('Comment', commentSchema);

module.exports = Comment; 