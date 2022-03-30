const express = require('express');
const router = express.Router();

const {
    getEvent,
    getEvents,
    getRidesByEvent,
    createEvent
} = require("../controllers/events");

router.route("/get/:eventName").get(getEvent);
router.route("/getall").get(getEvents);
router.route("/rides/:eventName").get(getRidesByEvent);
router.route("/create").post(createEvent);

module.exports = router;