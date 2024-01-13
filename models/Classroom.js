const mongoose = require("mongoose");
const gradeCompositionSchema = require("./GradeComposition");

const teacherSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  fullname: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
  },
  address: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "TEACHER",
  },
  subject: {
    type: String,
  },
  isInvited: {
    type: Boolean,
    default: false,
  },
  isJoined: {
    type: Boolean,
    default: false,
  },
});

const studentSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: false,
  },
  studentId: {
    type: String,
    default: "",
  },
  fullname: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
  },
  address: {
    type: String,
    default: "",
  },
  email: {
    type: String,
  },
  profilePic: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "STUDENT",
  },
  isInvited: {
    type: Boolean,
    default: false,
  },
  isJoined: {
    type: Boolean,
    default: false,
  },
  grades: [
    {
      grade: {
        type: Number,
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
      tempGrade: {
        type: Number,
      },
    },
  ],
});

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: [String],
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
    },
    categoryCode: {
      type: String,
      required: true,
    },
    students: [studentSchema],
    teachers: [teacherSchema],
    createdUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    invitationCode: {
      type: String,
      default: Math.random()
        .toString(36)
        .slice(2, Math.floor(Math.random() * 3) + 7),
    },
    gradeComposition: [gradeCompositionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Classroom", classroomSchema);
