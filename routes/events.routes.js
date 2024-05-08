const Event = require("../models/Event.model");
const router = require("express").Router();
const {
  isAuthenticated,
  canModifyEvent,
} = require("../middleware/route-guard.middleware"); // Ensure the path matches your directory structure

// GET all events (publicly accessible)
// Example in an Express.js route
router.get("/", async (req, res) => {
  const { limit = 15, offset = 0, organizer, attendee, eventType } = req.query;
  
  const query = {};
  if (organizer) query.organizer = organizer;
  if (attendee) query.attendees = attendee; // Assuming you're passing the user ID to find events they're attending
  if (eventType) query.eventType = eventType;

  try {
      const events = await Event.find(query)
          .skip(parseInt(offset))
          .limit(parseInt(limit))
          .populate("organizer", "username")
          .populate("attendees", "username"); // Adjust fields as necessary for populating attendee details

      res.status(200).json(events);
  } catch (err) {
      console.error("Error retrieving events:", err);
      res.status(500).json({ message: "Error retrieving events" });
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
