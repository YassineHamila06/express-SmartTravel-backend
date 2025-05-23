const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },  
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        required: true,
    },
}, { timestamps: true });


const Event = mongoose.model("Event", eventSchema);

module.exports = Event;