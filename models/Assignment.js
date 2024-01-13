const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    document: {
        type: [String],
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    classroom: {
        type: mongoose.Schema.ObjectId,
        ref: "Classroom",
        required: true,
    },
    // gradeComposition: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "GradeComposition",
    // },
    gradeComposition: {
        type: String,
    },
    maxPoint: {
        type: Number,
        required: true,
    },
},  { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
