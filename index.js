const express = require("express");

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const passport = require("passport");
const session = require("express-session");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const bookingRouter = require("./routes/booking");
const classRouter = require("./routes/classroom");
const assignmentRouter = require("./routes/assignment");
const gradeRouter = require("./routes/grade");

dotenv.config();
require("./services/passport");

const app = express();

// https://edulearning.vercel.app

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

const publicPath = path.join(__dirname, "./public");
app.use("/public", express.static(publicPath));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
});

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/avatars");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); // dặt lại tên cho file
  },
});

const classroomStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/classroom");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const assignmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/assignment");
  },
});


const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/document/assignment");
  },
});

const photoMiddleware = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const extensionImageList = [".png", ".jpg", ".jpeg", ".webp"];
    const extension = file.originalname.slice(-4);
    const check = extensionImageList.includes(extension);
    if (check) {
      cb(null, true);
    } else {
      cb(new Error("extention không hợp lệ"));
    }
  },
});

const avatarMiddlewware = multer({
  storage: avatarStorage,
  fileFilter: function (req, file, cb) {
    const extensionImageList = [".png", ".jpg", ".jpeg", "svg"];
    const extension = file.originalname.slice(-4);
    const check = extensionImageList.includes(extension);
    if (check) {
      cb(null, true);
    } else {
      cb(new Error("extention không hợp lệ"));
    }
  },
});

const classroomMiddleware = multer({
  storage: classroomStorage,
  fileFilter: function (req, file, cb) {
    const extensionImageList = [".png", ".jpg", ".jpeg", ".webp"];
    const extension = file.originalname.slice(-4);
    const check = extensionImageList.includes(extension);
    if (check) {
      cb(null, true);
    } else {
      cb(new Error("extention không hợp lệ"));
    }
  },
});

const assignmentMiddleware = multer({
  storage: assignmentStorage,
  fileFilter: function (req, file, cb) {
    console.log("file", file);
    const extensionImageList = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
    const extension = file.originalname.slice(-4);
    const check = extensionImageList.includes(extension);
    if (check) {
      cb(null, true);
    } else {
      cb(new Error("extention không hợp lệ"));
    }
  },
});

const documentMiddleware = multer({
  storage: assignmentStorage,
  fileFilter: function (req, file, cb) {
    console.log("file", file);
    const extensionImageList = [".pdf", ".docx"];
    const extension = file.originalname.slice(-4);
    const check = extensionImageList.includes(extension);
    if (check) {
      cb(null, true);
    } else {
      cb(new Error("extention không hợp lệ"));
    }
  },
});



app.post(
  "/api/upload-photo",
  photoMiddleware.array("photos", 100),
  (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath);
    }
    res.status(200).json(uploadedFiles);
  }
);

app.post(
  "/api/user/upload-avatar",
  avatarMiddlewware.single("avatar"),
  (req, res) => {
    const { file } = req;
    const urlImage = `${file.path}`;
    try {
      res.status(200).json({
        profilePic: urlImage,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

app.post(
  "/api/upload-classroon",
  classroomMiddleware.array("classroooms", 100),
  (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath);
    }
    res.status(200).json(uploadedFiles);
  }
);

app.post(
  "/api/upload-assignment",
  assignmentMiddleware.array("assignments", 100),
  (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath);
    }
    res.status(200).json(uploadedFiles);
  }
);

app.post(
  "/api/upload-document",
  documentMiddleware.array("documents", 100),
  (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath);
    }
    res.status(200).json(uploadedFiles);
  }
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/book", bookingRouter);
app.use("/api/classroom", classRouter);
app.use("/api/assignment", assignmentRouter);
app.use("/api/grade", gradeRouter);

const PORT = process.env.PORT || 5000;
const URI = process.env.DB_URL;

mongoose.set("strictQuery", false);
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
