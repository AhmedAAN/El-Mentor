import express from "express";
import { addStudent } from "../../controllers/students/add-student";
import { listStudent } from "../../controllers/students/get-student";
import { listStudents } from "../../controllers/students/get-students";
import { deleteStudent } from "../../controllers/students/delete-student";
import { updateStudent } from "../../controllers/students/update-student";
import verifyToken from "../../validation/users/compare-token";
import verifyAdmin from "../../validation/admin/verify-admin";
import verifyAdminOrStudent from "../../validation/student/student-or-admin";

const router = express.Router();

router.get("/listStudents", [verifyToken], listStudents);
router.get("/listStudent/:id", listStudent);
router.post("/student/signup", addStudent);//
router.delete(
  "/removeStudent",
  [verifyToken],
  deleteStudent
); //i put only important middlewares and others are made but in there folders.//
router.patch(
  "/updateStudent",
  [verifyToken],
  updateStudent
); //i put only important middlewares and others are made but in there folders//

export default router;
