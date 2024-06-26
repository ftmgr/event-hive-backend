const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/route-guard.middleware");

const router = require("express").Router();

router.get("/", (req, res) => {
    res.json("Here's the Auth");
});


// Signup
router.post("/signup", async (req, res) => {
    // Get back the data from the body
    // Encrypt the password
    const salt = bcrypt.genSaltSync(13);
    const passwordHash = bcrypt.hashSync(req.body.password, salt);
    // Create a new User
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            passwordHash: passwordHash
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

// Login
router.post("/login", async (req, res) => {
    // Get back the credentials from the body
    // Check if we have a user with this email
    try {
        const potentialUser = await User.findOne({ email: req.body.email });
        if (potentialUser) {
            // Check if the password is correct
            if (bcrypt.compareSync(req.body.password, potentialUser.passwordHash)) {
                // User has the right credentials
                const authToken = jwt.sign(
                    {
                        userId: potentialUser._id,
                    },
                    process.env.TOKEN_SECRET,
                    {
                        algorithm: "HS256",
                        expiresIn: "6h",
                    }
                );

                res.status(200).json({ token: authToken });
            } else {
                res.status(400).json({ mesage: "Incorrect password" });
            }
        } else {
            res.status(400).json({ mesage: "No user with this username" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ mesage: "There was a problem" });
    }
});

// Verify route
router.get("/verify", isAuthenticated, (req, res) => {
    res.status(200).json({ message: "User verified successfully!" });
});


router.get("/user-details", isAuthenticated, (req, res) => {
    User.findById(req.userId)
      .select("-passwordHash") // Exclude the password field
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User details fetched successfully", user });
      })
      .catch(err => {
        res.status(500).json({ message: "Failed to retrieve user details", error: err });
      });
  });

  

  router.patch("/update-profile", isAuthenticated, async (req, res) => {
    const userId = req.userId;
    const { username } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: "Username already taken." });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true,
            fields: '-passwordHash'
        });
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Failed to update user profile", error });
    }
});



// PATCH add to favorite events
router.patch("/favorite-add", isAuthenticated, async (req, res) => {
    const userId = req.userId;
    const { eventId } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $addToSet: { favoritedEvents: eventId }
        }, {
            new: true,
            fields: '-passwordHash'
        });
        res.json({ message: "Event added to favorites successfully", user: updatedUser });
    } catch (error) {
        console.error("Error adding event to favorites:", error);
        res.status(500).json({ message: "Failed to add event to favorites", error: error });
    }
});

// PATCH remove from favorite events
router.patch("/favorite-remove", isAuthenticated, async (req, res) => {
    const userId = req.userId;
    const { eventId } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $pull: { favoritedEvents: eventId }
        }, {
            new: true,
            fields: '-passwordHash'
        });
        res.json({ message: "Event removed from favorites successfully", user: updatedUser });
    } catch (error) {
        console.error("Error removing event from favorites:", error);
        res.status(500).json({ message: "Failed to remove event from favorites", error: error });
    }
});


module.exports = router;