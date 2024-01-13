const Assignment = require("../models/Assignment");
const ApiFeature = require("../utils/ApiFeature");
const Classroom = require("../models/Classroom");

const assignmentController = {
  createAssignment: async (req, res) => {
    const newAssignment = new Assignment(req.body);
    try {
      const savedAssignment = await newAssignment.save();
      const classroom = await Classroom.findById(req.params.classId);

      classroom.students.forEach((student) => {
        student.grades.push({
          assignmentId: savedAssignment._id,
        });
      });
      await classroom.save();
      res.status(200).json(savedAssignment);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getAllAssignments: async (req, res) => {
    try {
      const apiFeature = new ApiFeature(Assignment.find(), req.query)
        .search()
        .filter();
      const assignment = await apiFeature.query;
      res.status(200).json(assignment);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getAssignmentByClass: async (req, res) => {
    try {
      const assignment = await Assignment.find({
        classroom: req.params.id,
      });
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found !!!",
        });
      }
      res.status(200).json(assignment);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getDetailAssignment: async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found !!!",
        });
      }
      res.status(200).json(assignment);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  deleteAssignment: async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found !!!",
      });
    }
    const classroom = await Classroom.findById(req.params.classId);
    classroom.students.forEach((student) => {
      student.grades = student.grades.filter(
        (grade) => grade.assignmentId != req.params.id
      );
    });
    await classroom.save();
    
    try {
      await assignment.remove();
      return res.status(200).json({
        success: true,
        message: "Assignment has been deleted successfully",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  updateAssignment: async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found !!!",
      });
    }
    try {
      const { title, description, dueDate } = req.body;
      assignment.title = title || assignment.title;
      assignment.description = description || assignment.description;
      assignment.dueDate = dueDate || assignment.dueDate;
      const updatedAssignment = await assignment.save();
      res.status(200).json(updatedAssignment);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = assignmentController;
