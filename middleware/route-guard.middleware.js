const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Comment = require("../models/Comment.model");

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Assumes a 'Bearer token' format
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = payload.userId; // Store the user ID from the token in the request
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};


// Check if the user is admin
const isAdmin = async (req, res, next) => {
  if (req.body.userType.includes("admin")) {
    console.log("I'm Gandalf the White ")
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
      event.organizer.equals(req.body._id) ||
      req.body.userType.includes("admin")
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
  console.log('can modify content', req.body ,res.body)
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow the operation if the user is an admin or the commenter
    if (
            req.body.userType.includes("admin") ||
      comment.commenter.equals(req.body._id)
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
