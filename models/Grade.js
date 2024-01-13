const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
    grade: {
        type: Number,
        required: true,
    },
    assignmentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Assignment",
        required: true, 
    },
    isFinal: {
        type: Boolean,
        default: false,
    },
    // studentId: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "User",
    //     required: true,
    // },
    review: {
        reviewerId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        feedback: {
            type: String,
        },
        reviewDate: {
            type: Date,
        },
      },
},  { timestamps: true });

module.exports = mongoose.model("Grade", gradeSchema);