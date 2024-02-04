import express from "express";
import createAdmin from "../../controllers/admin/create-admin";
import getAdmins from "../../controllers/admin/get-admin";
import deleteAdmin from "../../controllers/admin/delete-admin";
import updateAdmin from "../../controllers/admin/update-admin";

const router = express.Router();

router.get("/admin", getAdmins); //
router.post("/admin", createAdmin); //
router.delete("/admin/:adminId", deleteAdmin);
router.patch("/admin/:adminId", updateAdmin);

export default router;
