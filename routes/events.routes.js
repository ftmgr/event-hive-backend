const Event = require("../models/Event.model");
const mongoose = require('mongoose');
const router = require("express").Router();
const {
  isAuthenticated,
  canModifyEvent,
} = require("../middleware/route-guard.middleware"); // Ensure the path matches your directory structure



// GET all events (publicly accessible)
// WEIRD ROUTES ROUTE ROUTE
// Adjusted backend route to include total count
router.get("/", async (req, res) => {
  const { limit = 15, offset = 0, organizer, attendee, eventType } = req.query;
  
  const query = {};
  if (organizer) query.organizer = organizer;
  if (attendee) query.attendees = attendee;
  if (eventType) query.eventType = eventType;

  try {
      const total = await Event.countDocuments(query); // Get total count of documents matching the query
      const events = await Event.find(query)
          .skip(parseInt(offset))
          .limit(parseInt(limit))
          .populate("organizer", "username")
          .populate("attendees", "username");

      res.status(200).json({ events, total }); // Send both events and total count
  } catch (err) {
      console.error("Error retrieving events:", err);
      res.status(500).json({ message: "Error retrieving events" });
  }
});


// Endpoint to get multiple events by a list of IDs
router.get('/by-ids', async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  try {
    const eventIds = ids.split(',').map(id => {
      try {
        return new mongoose.Types.ObjectId(id);  // Validate each id is a valid ObjectId
      } catch (error) {
        console.error("Invalid ObjectId format:", id, error);
        return null;
      }
    }).filter(id => id !== null);

    if (eventIds.length === 0) {
      return res.status(400).json({ message: "Invalid IDs provided" });
    }

    const events = await Event.find({ '_id': { $in: eventIds } })
                              .populate({
                                path: 'organizer',
                                select: 'username'  // Only select the username of the organizer
                              });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error retrieving events by IDs:", error);
    res.status(500).json({ message: "Error retrieving events", details: error.message });
  }
});




// GET a single event by id (publicly accessible)
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("organizer", "username")
      .populate("attendees", "username"); // Populate usernames of attendees
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving event" });
  }
});





// POST a new event
router.post("/", isAuthenticated,  async (req, res) => {
  try {
    console.log('POSTING EVENT REQ AND RES BODY',req.body,res.body)
    const event = new Event({ ...req.body, organizer: req.userId });
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Error creating event" });
  }
});

// PATCH update an event
router.patch("/:eventId", isAuthenticated, canModifyEvent, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedEvent) {
      res.status(200).json(updatedEvent);
    } else {
      res.status(404).json({ message: "No event found with this ID" });
    }
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Error updating event", error: err.toString() });
  }
});


// PATCH route to add an attendee to an event
router.patch("/:eventId/attend", isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $addToSet: { attendees: req.userId } }, // Use $addToSet to prevent duplicates
      { new: true }
    ).populate("attendees", "username");
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error adding attendee to event" });
  }
});

// PATCH route to remove an attendee from an event
router.patch("/:eventId/leave", isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $pull: { attendees: req.userId } }, // Use $pull to remove the user ID from attendees
      { new: true }
    ).populate("attendees", "username");
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error removing attendee from event" });
  }
});


// DELETE an event
router.delete(
  "/:eventId",
  isAuthenticated,
  canModifyEvent,
  async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.eventId);
      res.status(200).send("Event deleted successfully");
    } catch (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ message: "Error deleting event" });
    }
  }
);

module.exports = router;
