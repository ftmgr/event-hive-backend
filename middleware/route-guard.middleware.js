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
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.userType === "admin") {
      console.log("Admin privileges confirmed.");
      next();
    } else {
      res.status(403).json({ message: "Access denied: Requires admin privileges" });
    }
  } catch (error) {
    console.error("Error verifying admin status:", error);
    res.status(500).json({ message: "Server error during admin check" });
  }
};


// Middleware to check if the user can modify the event (create, update, delete)
const canModifyEvent = async (req, res, next) => {
  const eventId = req.params.eventId;  // Assuming eventId is always in the URL for modification routes

  try {
    const event = await Event.findById(eventId).populate('organizer');
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current user is the organizer or an admin
    if (event.organizer.equals(user._id) || user.userType === "admin") {
      next();
    } else {
      res.status(403).json({
        message: "Unauthorized: You are not authorized to modify this event"
      });
    }
  } catch (error) {
    console.error("Failed to verify event organizer status:", error);
    res.status(500).json({ message: "Server error during authorization check" });
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
