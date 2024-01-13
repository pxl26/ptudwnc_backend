const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    numOfDays: {
        type: Number,
    },
    maxGuests: {
        type: Number,
    },
    qnt: {
        type: Number,
        required: true
    },
    room:{
        type: mongoose.Schema.ObjectId,
        ref: "Room",
        required: true,
    }
})

const bookingSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.ObjectId,
        ref: "Place",
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    userInfo: {
        fullName: {
            type: String,
        },
        phone: {type: String},
        IdentifyCard: {type: String}
    },
    cart: [cartSchema],
    checkIn:{
        type: String,
        required: true
    },
    checkOut: {
        type: String,
        required: true
    },
    numOfGuest: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
      },
      paidAt: {
        type: Date,
        required: true,
      },

      orderStatus: {
        type: String,
        default: "Processing",
      },
    taxPrice: {
        type: Number,
        default: 0.0
    },
    totalPrice: {
        type: Number
    }

}, {timestamps: true});

module.exports = mongoose.model("booking", bookingSchema)