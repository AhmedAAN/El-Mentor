import express from "express";
import login from "../../controllers/logIn/login";
import forget from "../../controllers/logIn/forget";
import reset from "../../controllers/logIn/reset";
import verifyToken from "../../validation/users/compare-token";
import logout from "../../controllers/logIn/logout";

const router = express.Router();
router.delete("/logout", [verifyToken], logout);//don't use it
router.post("/login", login);
router.post("/users/forget", forget);
router.post("/users/reset", reset);

export default router;
