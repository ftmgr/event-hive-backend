const { Schema, model } = require('mongoose')

// Event schema
const eventSchema = new Schema(
    {
        eventname: {
            type: String,
            required: [true, 'Event name is required.'],
            trim: true,
        },
        description: {
            type: String,
            default: 'No description provided.',
            trim: true,
        },
        photo: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required.'],
        },
        date: {
            type: Date,

        },
        organizer: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        eventType: {
            type: String,
            enum: ['Conference', 'Meetup', 'Seminar', 'Workshop'],  // Example categories
            trim: true,
        },
        attendees: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
)

const Event = model('Event', eventSchema);

module.exports = Event; 