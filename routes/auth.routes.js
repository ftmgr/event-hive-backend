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
    console.log(req.body);
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
    console.log(req.body);
    // Check if we have a user with this email
    try {
        const potentialUser = await User.findOne({ email: req.body.email });
        if (potentialUser) {
            // Check if the password is correct
            if (bcrypt.compareSync(req.body.password, potentialUser.passwordHash)) {
                // User has the right credentials
                console.log(process.env.TOKEN_SECRET);
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

// Verify
router.get("/verify", /* exampleMiddleware, */ isAuthenticated, (req, res) => {
    res.json({ message: "Hello", data: req.tokenPayload });
});

module.exports = router;