import express from "express";
import { addMentor } from "../../controllers/mentor/add-mentor";
import { deleteMentor } from "../../controllers/mentor/delete-mentor";
import { updateMentor } from "../../controllers/mentor/update-mentor";
import { listMentor } from "../../controllers/mentor/list-mentor";
import { listMentors } from "../../controllers/mentor/list-mentors";
import { getMentorEmail } from "../../controllers/mentor/get-mentor-email";
import verifyToken from "../../validation/users/compare-token";
import verifyAdminOrMentor from "../../validation/mentor/mentor-or-admin";
import  updateUser  from "../../controllers/mentor/updateUser";

//router use
const router = express.Router();
//routes
router.get("/listMentors", listMentors);//
router.get("/listMentor/:id", listMentor);
router.get("/mentorEmail/:id", getMentorEmail);//
router.post("/mentor/signup", addMentor);//
router.delete(
  "/deleteUser",
  [verifyToken],
  deleteMentor
);//
router.patch(
  "/updateUser",
  [verifyToken],
  updateMentor
);//
router.patch("/updateOne",[verifyToken],updateUser)//<<
export default router;
