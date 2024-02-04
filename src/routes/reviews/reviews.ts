import express from "express";
import showMentorsReviews from "../../controllers/reviews/show-mentor-reviews";
import showReview from "../../controllers/reviews/show-review";
import addReview from "../../controllers/reviews/add-review";
import deleteReview from "../../controllers/reviews/delete-review";
import updateReview from "../../controllers/reviews/update-review";
import verifyToken from "../../validation/users/compare-token";
import verifyAdminOrStudent from "../../validation/admin/verify-admin-or-reviewer";
import studentReview from "../../validation/student/studentReview";
const router = express.Router();

router.get("/reviews/:mentorId", showMentorsReviews);
router.get("/review/:reviewId", showReview);
router.post("/review/:mentorId", [verifyToken], addReview);
router.delete("/review/:reviewId",[ verifyToken], deleteReview);//verifyAdminOrStudent:for admin and the user who made the review, should be able to delete it
router.put("/updateReview/:reviewId", [verifyToken], updateReview);//studentReview:for student to update review for a mentor

export default router;
