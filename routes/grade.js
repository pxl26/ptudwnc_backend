const gradeController = require("../controllers/gradeController");
const authMiddleware = require("../middleware/authMiddleware");
const router = require("express").Router();

//create grade
router.post("/", authMiddleware.authorizeRole, gradeController.createGrade);

//Get grade by assignment id
router.get(
  "/assignment/:id",
  authMiddleware.verifyToken,
  gradeController.getGradeByAssignment
);

//Get grade by user id
router.get(
  "/student/",
  authMiddleware.verifyToken,
  gradeController.getGradeByUserId
);

// Delete grade
router.delete(
  "/:id",
  authMiddleware.authorizeRole,
  gradeController.deleteGrade
);

// Update Grade
router.put("/:id", authMiddleware.authorizeRole, gradeController.updateGrade);

module.exports = router;
