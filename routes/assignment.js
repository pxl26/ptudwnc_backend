const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const router = require("express").Router();

//create assignment
router.post(
  "/classroom/:classId",
  authMiddleware.verifyToken,
  assignmentController.createAssignment
);

//get assignments by classroom
router.get(
  "/:id",
  authMiddleware.verifyToken,
  assignmentController.getAssignmentByClass
);

//get assignments
router.get("/", assignmentController.getAllAssignments);

//get detail assignment
router.get("/detail/:id", assignmentController.getDetailAssignment);

//delete assignment
router.delete(
  "/:id/classroom/:classId",
  authMiddleware.verifyToken,
  assignmentController.deleteAssignment
);

//edit assignment
router.put(
  "/:id",
  authMiddleware.authorizeRole,
  assignmentController.updateAssignment
);

module.exports = router;
