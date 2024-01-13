const mongoose = require("mongoose");

const gradeCompositionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    weight: {
        type: Number,
        default: 0,
    }
}, {timestamps: true});

module.exports = gradeCompositionSchema;