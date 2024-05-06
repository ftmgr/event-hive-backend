const router = require("express").Router();
const Comment = require("../models/Comment.model");
const { isAuthenticated, canModifyComment } = require("../middleware/route-guard.middleware");

// GET all comments for a specific event
router.get("/event/:eventId", async (req, res) => {
  try {
    const comments = await Comment.find({
      eventId: req.params.eventId,
    }).populate("commenter", "username");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving comments" });
  }
});

// POST a new comment
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const newComment = new Comment({
      commentText: req.body.commentText,
      eventId: req.body.eventId,
      commenter: req.body.commenter, // Assuming the user ID is stored on req.user by isAuthenticated middleware
    });
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Error creating comment" });
  }
});

// PUT update a comment
router.put(
  "/:commentId",
  isAuthenticated,
  canModifyComment,
  async (req, res) => {
    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        { commentText: req.body.commentText },
        { new: true, runValidators: true }
      );
      res.status(200).json(updatedComment);
    } catch (err) {
      console.error("Error updating comment:", err);
      res.status(500).json({ message: "Error updating comment" });
    }
  }
);

// DELETE a comment
router.delete(
  "/:commentId",
  isAuthenticated,
  canModifyComment,
  async (req, res) => {
    try {
      await Comment.findByIdAndDelete(req.params.commentId);
      res.status(200).send("Comment deleted successfully");
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Error deleting comment" });
    }
  }
);

module.exports = router;
