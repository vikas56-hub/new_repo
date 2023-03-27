import express from "express";

const router = express.Router();
// middleware
import { auth, isEnrolled } from "../middlewares";

// controllers
import {
  read,
  Courses,
  subscribeCourse,
  getCourseById

} from "../controllers/course";


router.get("/courses", courses);
// image
// course

router.get("/course/:slug", read);


// Get all courses
router.get('/', Courses);

// Get a single course by ID
router.get('/:id', getCourseById);

// Subscribe to a course
router.post('/:id/subscribe', subscribeCourse);



// router.get("/api/cources", courses);
router.get("/check-enrollment/:courseId", auth, isEnrolled);



// router.get("/prices", auth, price )
// router.post("/session", auth, session);
// // router.post("/create-checkout-session", createcheckoutsession); 

// // router.post("/api/subscribeToCourse/:courseId", auth, subscribeToCourse);
// router.get("/stripe-success/:courseId", auth, stripeSuccess);

// router.get("/user-courses", auth, userCourses);
// router.get("/user/course/:slug", auth, isEnrolled, read);

// router.get("/api/cources", course);



module.exports = router;
