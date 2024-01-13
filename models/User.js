const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "https://i.imgur.com/WxNkK7J.png",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    role: {
      type: ["TEACHER", "STUDENT"],
      default: "STUDENT",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    activatedToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    studentId: {
      type: String,
      unique: true,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isNew && this.studentId !== "") {
    next();
    return;
  }

  let unique = false;
  while (!unique) {
    const id = Math.floor(10000000 + Math.random() * 90000000).toString(); // Generate a random 8-digit number
    const user = await this.constructor.findOne({ studentId: id });
    if (!user) {
      this.studentId = id;
      unique = true;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
