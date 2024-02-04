import express from "express";
import consultation from "../../controllers/services/consultation";
import mockInterview from "../../controllers/services/mock-interview";
import mentoring from "../../controllers/services/mentoring";
import verifyToken from "../../validation/users/compare-token";

const router = express.Router();

router.get("/consultation", consultation);
router.get("/mockInterview", mockInterview);
router.get("/mentoring", mentoring);

export default router;
