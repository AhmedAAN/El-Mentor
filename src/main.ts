import dotenv from "dotenv";
import { connection } from "./models/connection";
import app from "./server";
import logInRouter from "./routes/login/logIn";
import mentorRouter from "./routes/mentor/mentor-routes";
import servicesRouter from "./routes/services/services";
import studentRouter from "./routes/student/student-routes";
import reviewsRouter from "./routes/reviews/reviews";
import adminRouter from "./routes/admin/admin";

dotenv.config();
//using routesss

//connecting to database
connection();

//Activating routes
app.use(logInRouter);
app.use(mentorRouter);
app.use(servicesRouter);
app.use(studentRouter);
app.use(reviewsRouter);
app.use(adminRouter);

