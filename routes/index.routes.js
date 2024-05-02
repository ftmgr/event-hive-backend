const router = require('express').Router()
const eventRoutes = require("./events.routes");
const commentsRoutes = require('./comments.routes')
// starting with /api 
router.get('/', (req, res) => {
  res.json('All good in here')
})

// Events Routes
router.use("/events",eventRoutes);

// Comments Routes
router.use("/comments", commentsRoutes)


// The final Destination :D
module.exports = router
