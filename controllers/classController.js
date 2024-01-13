const Classroom = require("../models/Classroom");
const ApiFeature = require("../utils/ApiFeature");
const mailer = require("../services/mailer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { utils, readFile } = require("xlsx");

const classController = {
  createClass: async (req, res) => {
    const newClass = new Classroom({
      createdUser: req.user.id,
      ...req.body,
      teachers: [
        {
          accountId: req.user.id,
          fullname: req.user.username,
          email: req.user.email,
          profilePic: req.user.profilePic,
          isJoined: true,
        },
      ],
    });

    try {
      const savedClass = await newClass.save();
      res.status(200).json(savedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getAllClasses: async (req, res) => {
    try {
      const apiFeature = new ApiFeature(Classroom.find(), req.query)
        .search()
        .filter();
      let classroom = await apiFeature.query;
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getClassById: async (req, res) => {
    try {
      const classroom = await Classroom.findById(req.params.id);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      const classWithPopulate = await classroom.populate(
        "students.accountId",
        "teachers.accountId"
      );
      res.status(200).json(classWithPopulate);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getClassByCreatedUser: async (req, res) => {
    try {
      const classroom = await Classroom.find({
        createdUser: req.user.id,
      });
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getAllParticipatedClass: async (req, res) => {
    try {
      const classroom = await Classroom.find({
        $or: [
          { createdUser: req.user.id },
          { teachers: { $elemMatch: { accountId: req.user.id } } },
          { students: { $elemMatch: { accountId: req.user.id } } },
        ],
      });
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  deleteClass: async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }
    try {
      await classroom.remove();
      return res.status(200).json({
        success: true,
        message: "Classroom has been deleted successfully",
      });
    } catch (error) {
      console.log(error);
    }
  },
  updateClass: async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }
    try {
      const {
        name,
        image,
        description,
        ratings,
        categoryCode,
        students,
        teachers,
        isActive,
      } = req.body;
      classroom.name = name || classroom.name;
      classroom.image = image || classroom.image;
      classroom.description = description || classroom.description;
      classroom.ratings = ratings || classroom.ratings;
      classroom.categoryCode = categoryCode || classroom.categoryCode;
      classroom.students = students || classroom.students;
      classroom.teachers = teachers || classroom.teachers;
      classroom.isActive = isActive || classroom.isActive;
      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getClassByUserId: async (req, res) => {
    try {
      const classroom = await Classroom.find({
        createdUser: req.params.id,
      });
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  checkClassJoined: async (req, res) => {
    try {
      const classroom = await Classroom.findOne({
        _id: req.params.id,
        $or: [
          { createdUser: req.user.id },
          {
            teachers: {
              $elemMatch: { accountId: req.user.id, isJoined: true },
            },
          },
          {
            students: {
              $elemMatch: { accountId: req.user.id, isJoined: true },
            },
          },
        ],
      });
      if (!classroom) {
        return res.status(200).json({
          joined: false,
          classroom: classroom,
        });
      }
      res.status(200).json({
        joined: true,
        classroom: classroom,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  joinClassViaCode: async (req, res) => {
    try {
      let classroom = await Classroom.findOne({
        invitationCode: req.body.code,
      });

      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      const student = classroom.students.find(
        (student) => student.accountId === req.user.id
      );

      if (!student) {
        const newStudent = {
          accountId: req.user.id,
          studentId: req.user.studentId,
          fullname: req.user.username,
          email: req.user.email,
          profilePic: req.user.profilePic,
          isJoined: true,
        };
        classroom.students.push(newStudent);
      } else if (!student.isJoined) {
        Classroom.findOneAndUpdate(
          {
            _id: req.body.id,
            students: { $elemMatch: { accountId: req.user.id } },
          },
          { $set: { "students.$.isJoined": true } },
          { new: true },
          (err, doc) => {
            if (err) {
              console.log("Something wrong when updating data!");
            }
            classroom = doc;
          }
        );
      }

      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  validateInvitationLink: async (req, res) => {
    try {
      const classroom = await Classroom.findById(req.params.id);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }
      if (classroom.invitationCode !== req.query.cjc) {
        return res.status(401).json({
          success: false,
          message: "Invalid invitation code !!!",
        });
      }
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  joinClassViaInvitationLink: async (req, res) => {
    try {
      let classroom = await Classroom.findById(req.body.id);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      if (classroom.invitationCode !== req.body.code) {
        return res.status(401).json({
          success: false,
          message: "Invalid invitation code !!!",
        });
      }

      const student = classroom.students.find(
        (student) => student.accountId === req.user.id
      );

      if (!student) {
        const newStudent = {
          accountId: req.user.id,
          studentId: req.user.studentId,
          fullname: req.user.username,
          email: req.user.email,
          profilePic: req.user.profilePic,
          isJoined: true,
        };
        classroom.students.push(newStudent);
      } else if (!student.isJoined) {
        Classroom.findOneAndUpdate(
          {
            _id: req.body.id,
            students: { $elemMatch: { accountId: req.user.id } },
          },
          { $set: { "students.$.isJoined": true } },
          { new: true },
          (err, doc) => {
            if (err) {
              console.log("Something wrong when updating data!");
            }
            classroom = doc;
          }
        );
      }

      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  sendEmailInvitation: async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found !!!",
      });
    }

    const newAccount = {
      accountId: user.id,
      fullname: user.username,
      email: user.email,
      profilePic: user.profilePic,
      isInvited: true,
    };

    if (req.body.role == "TEACHER") {
      const teacher = await Classroom.findOne({
        _id: req.params.id,
        teachers: { $elemMatch: { email: req.body.email } },
      });

      if (teacher) {
        return res.status(400).json({
          success: false,
          message: "User already joined or invited to this class !!!",
        });
      }

      classroom.teachers.push(newAccount);
      await classroom.save();
    } else if (req.body.role == "STUDENT") {
      const student = await Classroom.findOne({
        _id: req.params.id,
        students: { $elemMatch: { email: req.body.email } },
      });

      if (student) {
        return res.status(400).json({
          success: false,
          message: "User already joined or invited to this class !!!",
        });
      }

      classroom.students.push(newAccount);
      await classroom.save();
    }

    const token = jwt.sign(
      {
        classId: classroom._id,
        role: req.body.role,
      },
      process.env.MY_SECRETKEY,
      {
        expiresIn: "3600s",
      }
    );

    const subject = `ELearning - Lời mời tham gia lớp học: "${classroom.name}"`;
    const link = `https://elearning-g2i8.onrender.com/api/classroom/email/redirect?token=${token}`;

    const html = `
    <p>Chào bạn <b>${req.user.username}</b>,</p>
    <p>Bạn nhận được email này vì bạn đã được mời tham gia vào lớp học <b>${classroom.name}</b> trên hệ thống ELearning.</p>
    <p>Để tham gia vào lớp học, bạn vui lòng nhấn vào link bên dưới.</p>
    <a href="${link}">Chấp nhận lời mời</a>
    <p>Trân trọng,</p>
    <p>Elearning Team</p>
    `;
    try {
      await mailer.sendMail(req.body.email, subject, html);

      res.status(200).json({
        success: true,
        message: "Send email successfully",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  validateEmailInvitationLink: async (req, res) => {
    try {
      const token = req.query.token;
      const decoded = jwt.verify(token, process.env.MY_SECRETKEY);
      if (!decoded.classId || !decoded.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid invitation link !!!",
        });
      }

      const classroom = await Classroom.findById(decoded.classId);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      res.redirect(
        `http://localhost:3000/classroom/invite/accept_token/${classroom._id}?token=${token}&role=${decoded.role}`
      );
    } catch (error) {
      res.status(500).json(error);
    }
  },
  joinClassViaEmail: async (req, res) => {
    try {
      let classroom = await Classroom.findById(req.body.id);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      if (req.body.token) {
        const decoded = jwt.verify(req.body.token, process.env.MY_SECRETKEY);
        if (decoded.role === "STUDENT") {
          const student = await Classroom.findOne({
            _id: req.body.id,
            students: { $elemMatch: { accountId: req.user.id } },
          });

          if (!student) {
            const newStudent = {
              accountId: req.user.id,
              studentId: req.user.studentId,
              fullname: req.user.username,
              email: req.user.email,
              profilePic: req.user.profilePic,
              isJoined: true,
            };
            classroom.students.push(newStudent);
          } else if (!student.isJoined) {
            Classroom.findOneAndUpdate(
              {
                _id: req.body.id,
                students: { $elemMatch: { accountId: req.user.id } },
              },
              { $set: { "students.$.isJoined": true } },
              { new: true },
              (err, doc) => {
                if (err) {
                  console.log("Something wrong when updating data!");
                }
                classroom = doc;
              }
            );
          }
        } else if (decoded.role === "TEACHER") {
          const teacher = await Classroom.findOne({
            _id: req.body.id,
            teachers: { $elemMatch: { accountId: req.user.id } },
          });

          if (!teacher) {
            const newTeacher = {
              accountId: req.user.id,
              studentId: req.user.studentId,
              fullname: req.user.username,
              email: req.user.email,
              profilePic: req.user.profilePic,
              isJoined: true,
            };
            classroom.teachers.push(newTeacher);
            await classroom.save();
          } else if (!teacher.isJoined) {
            Classroom.findOneAndUpdate(
              {
                _id: req.body.id,
                teachers: { $elemMatch: { accountId: req.user.id } },
              },
              { $set: { "teachers.$.isJoined": true } },
              { new: true },
              (err, doc) => {
                if (err) {
                  console.log("Something wrong when updating data!");
                }
                classroom = doc;
              }
            );
          }
        }
      }

      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  createGradeStructure: async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    try {
      const newGradeComposition = {
        name: req.body.name,
        weight: req.body.weight,
      };

      classroom.gradeComposition.push(newGradeComposition);
      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getGradeStructures: async (req, res) => {
    try {
      const classroom = await Classroom.findById(req.params.classId);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }
      res.status(200).json(classroom.gradeComposition);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  updateGradeStructureById: async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    const { name, weight } = req.body;

    try {
      const gradeComposition = classroom.gradeComposition.find(
        (gradeComposition) => gradeComposition._id == req.params.id
      );

      if (!gradeComposition) {
        return res.status(404).json({
          success: false,
          message: "Grade structure not found !!!",
        });
      }

      gradeComposition.name = name || gradeComposition.name;
      gradeComposition.weight = weight || gradeComposition.weight;

      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  deleteGradeStructure: async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    try {
      const gradeComposition = classroom.gradeComposition.find(
        (gradeComposition) => gradeComposition._id == req.params.id
      );

      if (!gradeComposition) {
        return res.status(404).json({
          success: false,
          message: "Grade structure not found !!!",
        });
      }

      gradeComposition.remove();
      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  updateGradeStructures: async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    try {
      const gradeCompositions = req.body;
      classroom.gradeComposition = gradeCompositions;
      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  uploadStudent: async (req, res) => {
    const workbook = readFile(req.file.path);
    const sheetNameList = workbook.SheetNames;
    const students = utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    let newStudents = [];

    for (let student of students) {
      const classStudents = classroom.students;
      const existedStudent = classStudents.find(
        (s) => s.studentId == student.studentId
      );

      if (existedStudent) {
        continue;
      }

      const user = await User.findOne({ studentId: student.studentId });
      let newStudent = {};

      if (!user) {
        newStudent = {
          studentId: student.studentId,
          fullname: student.fullname,
        };
      } else {
        newStudent = {
          accountId: user._id,
          studentId: student.studentId,
          fullname: student.fullname,
          ...user,
        };
      }

      newStudents.push(newStudent);
    }

    try {
      classroom.students.push(...newStudents);
      await classroom.save();
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  updateGrade: async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found !!!",
      });
    }

    try {
      const { studentId, assignmentId } = req.params;
      const { newGrade } = req.body;

      const student = classroom.students.find(
        (student) => student.studentId == studentId
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found !!!",
        });
      }

      const grade = student.grades.find(
        (grade) => grade.assignmentId == assignmentId
      );

      if (!grade) {
        student.grades.push({
          assignmentId: assignmentId,
          tempGrade: newGrade,
        });
      } else {
        grade.tempGrade = newGrade;
        grade.isFinal = false;
      }

      await classroom.save();
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  uploadAssignmentGrade: async (req, res) => {
    const workbook = readFile(req.file.path);
    const sheetNameList = workbook.SheetNames;
    const students = utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

    try {
      let classroom = await Classroom.findById(req.params.classId);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      for (let student of students) {
        await Classroom.findOneAndUpdate(
          {
            _id: req.params.classId,
          },
          {
            $set: {
              "students.$[elem].grades.$[elem2].tempGrade": parseInt(
                student.grade
              ),
            },
          },
          {
            arrayFilters: [
              { "elem.studentId": student.studentId },
              { "elem2.assignmentId": req.params.assignmentId },
            ],
            // new: true,
          },
          (err, doc) => {
            if (err) {
              console.log(err);
            }
            classroom = doc;
          }
        ).clone();
      }

      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  markGradeFinalized: async (req, res) => {
    try {
      let classroom = await Classroom.findById(req.params.classId);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: "Classroom not found !!!",
        });
      }

      await Classroom.findOneAndUpdate(
        {
          _id: req.params.classId,
        },
        {
          $set: {
            "students.$[elem].grades.$[elem2].isFinal": true,
            "students.$[elem].grades.$[elem2].grade": parseInt(req.body.grade),
            "students.$[elem].grades.$[elem2].tempGrade": null,
          },
        },
        {
          arrayFilters: [
            { "elem.studentId": req.params.studentId },
            { "elem2.assignmentId": req.params.assignmentId },
          ],
          // new: true,
        },
        (err, doc) => {
          if (err) {
            console.log(err);
          }
          classroom = doc;
        }
      ).clone();

      const updatedClass = await classroom.save();
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = classController;
