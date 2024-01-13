const classController = require("../controllers/classController");
const authMiddleware = require("../middleware/authMiddleware");
const router = require("express").Router();
const multer = require("multer");

const classroomStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/files/uploads");
  },
});

const classroomMiddleware = multer({
  storage: classroomStorage,
  fileFilter: function (req, file, cb) {
    console.log("file", file);
    const extensionFileList = ["csv", "xlsx"];
    const extension = file.originalname.split(".").pop();
    const check = extensionFileList.includes(extension);
    if (check) {
      cb(null, true);
    } else {
      cb(new Error("extention không hợp lệ"));
    }
  },
});

//Create Classroom by admin
router.post(
  "/admin/",
  authMiddleware.authorizeRole,
  classController.createClass
);

// Create Classroom by teacher
router.post(
  "/role-teacher",
  authMiddleware.verifyToken,
  classController.createClass
);

router.get("/", classController.getAllClasses);

router.get("/:id", classController.getClassById);

router.get(
  "/teacher/me",
  authMiddleware.verifyToken,
  classController.getClassByCreatedUser
);

router.get(
  "/teacher/:id",
  authMiddleware.verifyToken,
  classController.getClassByUserId
);

router.get(
  "/participate/me",
  authMiddleware.verifyToken,
  classController.getAllParticipatedClass
);

// Delete room
router.delete(
  "/admin/:id",
  authMiddleware.authorizeRole,
  classController.deleteClass
);
router.delete(
  "/role-teacher/:id",
  authMiddleware.verifyToken,
  classController.deleteClass
);

router.put(
  "/admin/:id",
  authMiddleware.authorizeRole,
  classController.updateClass
);
router.put(
  "/role-teacher/:id",
  authMiddleware.verifyToken,
  classController.updateClass
);

router.get(
  "/:id/account-joined",
  authMiddleware.verifyToken,
  classController.checkClassJoined
);
router.post(
  "/:id/accept/code",
  authMiddleware.verifyToken,
  classController.joinClassViaCode
);
router.get(
  "/:id/join/link",
  authMiddleware.verifyToken,
  classController.validateInvitationLink
);
router.post(
  "/accept/link",
  authMiddleware.verifyToken,
  classController.joinClassViaInvitationLink
);
router.post(
  "/:id/invite/email",
  authMiddleware.verifyToken,
  classController.sendEmailInvitation
);
router.get("/email/redirect", classController.validateEmailInvitationLink);
router.post(
  "/accept/email",
  authMiddleware.verifyToken,
  classController.joinClassViaEmail
);

// grade structure
router.post(
  "/:classId/grade-structure",
  authMiddleware.verifyToken,
  classController.createGradeStructure
);
router.get(
  "/:classId/grade-structure",
  authMiddleware.verifyToken,
  classController.getGradeStructures
);
router.put(
  "/:classId/grade-structure/:id",
  authMiddleware.verifyToken,
  classController.updateGradeStructureById
);
router.delete(
  "/:classId/grade-structure/:id",
  authMiddleware.verifyToken,
  classController.deleteGradeStructure
);
router.put(
  "/:classId/grade-structure",
  authMiddleware.verifyToken,
  classController.updateGradeStructures
);

router.post(
  "/:classId/import-student-list",
  authMiddleware.verifyToken,
  classroomMiddleware.single("grade"),
  classController.uploadStudent
);

router.put(
  "/:classId/student/:studentId/assignment/:assignmentId",
  authMiddleware.verifyToken,
  classController.updateGrade
);

router.post(
  "/:classId/assignment/:assignmentId/import-grade",
  authMiddleware.verifyToken,
  classroomMiddleware.single("assignmentGrade"),
  classController.uploadAssignmentGrade
);

router.put(
  "/:classId/student/:studentId/assignment/:assignmentId/mark-finalized",
  authMiddleware.verifyToken,
  classController.markGradeFinalized
);

module.exports = router;
