import express from "express";
import { addMentor } from "../../controllers/mentor/add-mentor";
import { deleteMentor } from "../../controllers/mentor/delete-mentor";
import { updateMentor } from "../../controllers/mentor/update-mentor";
import { listMentor } from "../../controllers/mentor/list-mentor";
import { listMentors } from "../../controllers/mentor/list-mentors";
import verifyToken from "../../validation/users/compare-token";
import verifyAdminOrMentor from "../../validation/mentor/mentor-or-admin";
//router use
const router = express.Router();
//routes
router.get("/listMentors", listMentors);//
router.get("/listMentor/:id", listMentor);//
router.post("/mentor/signup", addMentor);//
router.delete(
  "/deleteMentor",
  [verifyToken],
  deleteMentor
);//
router.patch(
  "/updateMentor",
  [verifyToken],
  updateMentor
);//

export default router;
