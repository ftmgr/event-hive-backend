const Event = require("../models/Event.model");
const router = require("express").Router();
const {
  isAuthenticated,
  canModifyEvent,
} = require("../middleware/route-guard.middleware"); // Ensure the path matches your directory structure

// GET all events (publicly accessible)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "username"); // Adjust fields as necessary
    res.status(200).json(events);
  } catch (err) {
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
router.post("/", isAuthenticated, canModifyEvent, async (req, res) => {
  try {
    const event = new Event({ ...req.body, organizer: req.user._id });
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Error creating event" });
  }
});

// PUT update an event
router.put("/:eventId", isAuthenticated, canModifyEvent, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Error updating event" });
  }
});

// PATCH route to add an attendee to an event
router.patch("/:eventId/attend", isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $addToSet: { attendees: req.user._id } }, // Use $addToSet to prevent duplicates
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
