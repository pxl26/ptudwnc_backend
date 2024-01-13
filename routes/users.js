const userControllers = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = require("express").Router();

// Get user
router.get("/admin", authMiddleware.authorizeRole, userControllers.getAllUser);
router.get("/:id", authMiddleware.authorizeRole, userControllers.getUserById);

// Update User
router.put(
  "/admin/:id",
  authMiddleware.authorizeRole,
  userControllers.updateUser
);

// Delete user
router.delete(
  "/admin/:id",
  authMiddleware.authorizeRole,
  userControllers.deleteUser
);

// Update status
router.put(
  "/me/status",
  authMiddleware.verifyToken,
  userControllers.updateStatusUser
);

// Get Profile
router
  .route("/me/profile")
  .get(authMiddleware.verifyToken, userControllers.getUserProfile);
// Update profile
router.put(
  "/me/profile",
  authMiddleware.verifyToken,
  userControllers.updateProfile
);

// Update status
router.put(
  "/me/status",
  authMiddleware.verifyToken,
  userControllers.updateStatusUser
);

module.exports = router;
