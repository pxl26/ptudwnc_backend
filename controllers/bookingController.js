const Booking = require("../models/Booking");
// const Room = require("../models/Room");


const BookingControllers = {
    createOrder: async(req, res) => {
        const {
            userInfo,
            cart,
            paymentMethod,
            taxPrice,
            totalPrice,
            checkIn,
            checkOut,
            numOfGuest
        } = req.body
        try {
            const order = await Booking({
                userInfo,
                cart,
                user: req.user.id,
                paymentMethod,
                taxPrice,
                totalPrice,
                checkIn,
                checkOut,
                paidAt: Date.now(),
                numOfGuest
            });
            const newOrder = await order.save();
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getOrderById: async(req, res) => {
      
        try {
            const order = await Booking.findById(req.params.id).populate('user', 'name email');
            if(!order){
                return res.status(404).json("Order not found !!!");
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    getMyOrders: async(req, res) => {
        try {
            const orders = await Booking.find({user: req.user.id});
            if(!orders){
                return res.status(404).json("Orders not found !!!");
            }
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getAllOrders: async(req, res) => {
        try {
            const orders = await Booking.find();
            let totalAmount = 0;
            orders.forEach((order) => {
                totalAmount += order.totalPrice;
            });

            res.status(200).json({orders, totalAmount});
        } catch (error) {
            res.status(500).json(error);
        }
    },
    // updateStock: async(id, quantity) => {
    //     const room = await Room.findById(id);
    //     if(!room){
    //         return res.status(404).json("Room not found !!!");
    //     }
    //     if(!room.countInStock){
    //         product.countInStock = -1;
    //     }
    //     room.countInStock -= quantity;
    //     await room.save();
    // },

    updateOrderByStatus: async(req, res) => {
        try {
            const order = await Booking.findById(req.params.id);
        if(!order){
            return res.status(404).json("Order not found !!!");
        }
        if(req.body.status === "Approved"){
            order.cart.forEach(async (o) => {
                await BookingControllers.updateStock(o.room, o.qnt)
            })
        }
        order.orderStatus = req.body.status;
        await order.save();
        res.status(200).json(order);

        } catch (error) {
            res.status(500).json(error);
        }
    },
    updateOrder: async(req, res) => {
        try {
            const {
                paymentMethod,
                orderStatus,
                taxPrice,
                checkOut
            } = req.body;
            const order = await Booking.findById(req.params.id);
            if(!order){
                return res.status(404).json("Order not found !!!");
            }
            order.paymentMethod = paymentMethod || order.paymentMethod,
            order.orderStatus = orderStatus || order.orderStatus,
            order.taxPrice= taxPrice || order.taxPrice,
            order.checkOut = checkOut || order.checkOut
            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    deleteOrder: async(req, res) => {
        try {
            const order = await Booking.findById(req.params.id);
            if(!order){
                return res.status(404).json("Order not found !!!");
            }
            await order.remove();
            res.status(200).json({
                message: "Order has been deleted"
            })
        } catch (error) {
            res.status(500).json(error);
        }
    }
};

module.exports = BookingControllers
