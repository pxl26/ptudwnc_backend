const Grade = require("../models/Grade");

const gradeController = {
  createGrade: async (req, res) => {
    const newGrade = new Grade(req.body);
    try {
      const savedGrade = await newGrade.save();
      res.status(200).json(savedGrade);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getGradeByAssignment: async (req, res) => {
    try {
      const grade = await Grade.find({
        assignmentId: req.params.id,
      });
      if (!grade) {
        return res.status(404).json({
          success: false,
          message: "Grade not found !!!",
        });
      }
      res.status(200).json(grade);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getGradeByUserId: async (req, res) => {
    try {
      const grade = await Grade.find({
        studentId: req.user.id,
      });
      if (!grade) {
        return res.status(404).json({
          success: false,
          message: "Grade not found !!!",
        });
      }
      res.status(200).json(grade);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  deleteGrade: async (req, res) => {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found !!!",
      });
    }
    try {
      await grade.remove();
      return res.status(200).json({
        success: true,
        message: "Grade has been deleted successfully",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  updateGrade: async (req, res) => {
    const newGrade = await Grade.findById(req.params.id);
    if (!newGrade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found !!!",
      });
    }
    try {
      const { grade } = req.body;
      newGrade.grade = grade || newGrade.grade;
      const updatedGrade = await newGrade.save();
      res.status(200).json(updatedGrade);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = gradeController;
