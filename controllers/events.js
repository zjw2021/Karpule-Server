const asyncHandler = require('../middleware/asyncHandler');
const Event = require('../models/Event');
const Ride = require('../models/Ride');

exports.getEvent = asyncHandler(async (req, res, next) => {
    const { eventName } = req.params;
    const event = await Event.findOne({ eventName });
    res.status(200).json(event);
});

exports.getEvents = asyncHandler(async (req, res, next) => {
    const events = await Event.find();
    res.status(200).json(events);
});

exports.getRidesByEvent = asyncHandler(async (req, res, next) => {
    const { eventName } = req.params;
    console.log(eventName);
    console.log(req.params);
    const rides = await Ride.find({ eventName });
    res.status(200).json(rides);
});

exports.createEvent = asyncHandler(async (req, res, next) => {
    const { name, color } = req.body;

    const eventWithSameName = await Event.findOne({ name });
    if (!!eventWithSameName) {
        res.status(400).json("Cannot create an event with the same name as a previous event");
    }

    try {
        const event = new Event({ name, color });
        await event.save();
        res.sendStatus(200).json(event);
    }
    catch (e) {
        res.sendStatus(400).json(`Failed to create event with name ${name} and color ${color}`);
    }
});