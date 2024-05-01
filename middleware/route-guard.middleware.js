const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Comment = require("../models/Comment.model");

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Assumes a 'Bearer token' format
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    // Fetch the full user object excluding the password and attach it to req
    User.findById(payload.userId)
      .select("-passwordHash") // Exclude the password field
      .then((user) => {
        if (!user) {
          return res.status(404).json("User not found");
        }
        req.user = user; // Now req.user is the full user document without the password
        next();
      })
      .catch((err) => {
        res.status(500).json("Failed to retrieve user");
      });
  } catch (error) {
    res.status(401).json("token not provided or not valid");
  }
};

// Check if the user is admin
const isAdmin = async (req, res, next) => {
  if (req.user.userType.includes("admin")) {
    next();
  } else {
    res.status(403).json("Access denied: Requires admin privileges");
  }
};

// Middleware to check if the user can modify the event (create, update, delete)
const canModifyEvent = async (req, res, next) => {
  const eventId = req.params.eventId || req.body.eventId; // handle both routes that might have eventId in different locations
  if (!eventId) {
    return next(); // If no eventId is involved, just proceed (e.g., creating a new event)
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json("Event not found");
    }

    if (
      event.organizer.equals(req.user._id) ||
      req.user.userType.includes("admin")
    ) {
      next();
    } else {
      res
        .status(403)
        .json({
          message: "Unauthorized: You are not authorized to modify this event",
        });
    }
  } catch (error) {
    console.error("Failed to verify event organizer status:", error);
    res.status(500).json("Server error during authorization check");
  }
};

// Middleware to check if the user is authorized to modify the comment
const canModifyComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow the operation if the user is an admin or the commenter
    if (
      req.user.userType.includes("admin") ||
      comment.commenter.equals(req.user._id)
    ) {
      req.comment = comment; // Store comment in request for further use
      next();
    } else {
      res
        .status(403)
        .json({
          message:
            "Unauthorized: You are not authorized to modify this comment",
        });
    }
  } catch (err) {
    console.error("Error checking comment modification permissions:", err);
    res.status(500).json({ message: "Server error checking permissions" });
  }
};

module.exports = { isAuthenticated, isAdmin, canModifyEvent, canModifyComment };
