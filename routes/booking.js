const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware")
const router = require("express").Router();

//Create Booking
router.post("/", authMiddleware.verifyToken, bookingController.createOrder);
//Get my orders
router.get("/me", authMiddleware.verifyToken, bookingController.getMyOrders);

//Get all orders
router.get("/", authMiddleware.authorizeRole, bookingController.getAllOrders);
//Get detail order
router.get("/:id", authMiddleware.authorizeRole, bookingController.getOrderById);

//Update order
router.put("/admin/:id", authMiddleware.authorizeRole, bookingController.updateOrder);
router.put("/status/:id", bookingController.updateOrderByStatus);

//Delete order
router.delete("/admin/:id", authMiddleware.authorizeRole, bookingController.deleteOrder);

module.exports = router;