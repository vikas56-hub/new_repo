import express from "express";
import Course from '../model/course';
import User from '../model/User';

import { Auth } from "../middleware/Auth";
import Stripe from "stripe";

const stripe = new Stripe(process.process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});


const router = express.Router();

// export const subscribeToCourse = async (req, res) => {
//     try {
//       if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
//         return res.status(400).send("Invalid course ID");
//       }
  
//       const course = await Course.findById(req.params.courseId).exec();
//       if (!course.paid) {
//         return res.status(400).send("This course is free");
//       }
  
//       // Create a Stripe customer or retrieve existing one
//       const customer = await stripe.customers.list({
//         email: req.user.email,
//         limit: 1
//       });
//       const customerExists = customer.data.length > 0;
  
//       const customerObj = customerExists ? customer.data[0] : await stripe.customers.create({
//         email: req.user.email,
//       });
  
//       // Create a Stripe session for checkout
//       const session = await stripe.checkout.sessions.create({
//         customer: customerObj.id,
//         payment_method_types: ["card"],
//         line_items: [
//           {
//             price: course.priceId,
//             quantity: 1
//           }
//         ],
//         mode: "subscription",
//         success_url: "https://example.com/success",
//         cancel_url: "https://example.com/cancel",
//         metadata: {
//           courseId: course._id.toString(),
//           userId: req.user._id.toString()
//         }
//       });
  
//       res.send(session);
  
//       // Update the user's subscription object
//       const user = await User.findById(req.user._id).exec();
//       user.subscriptions = user.subscriptions || [];
  
//       const existingSub = user.subscriptions.find(sub => sub.courseId.equals(course._id));
  
//       if (existingSub) {
//         if (existingSub.status === "active") {
//           throw new Error("You are already subscribed to this course");
//         } else {
//           existingSub.status = "active";
//           existingSub.subscriptionId = subscription.id;
//         }
//       } else {
//         user.subscriptions.push({
//           courseId: course._id,
//           subscriptionId: subscription.id,
//           status: "active",
//           startDate: Date.now()
//         });
//       }
  
//       await user.save();
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server error");
//     }
//   };
  

export const Courses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const subscribeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { user } = req;

    
    if (user.courses.includes(courseId)) {
      return res.status(400).json({ msg: 'User is already enrolled in this course' });
    }

  
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    
    const price = await stripe.prices.retrieve(course.priceId);

    
    
    let customer;
    if (!user.subscription) {
      customer = await stripe.customers.create({
        email: user.email,
      });

      user.subscription = {
        customerId: customer.id,
        subscriptionId: null,
        expires: null,
        enrolledCourses: [],
      };
      await user.save();
    } else {
      customer = await stripe.customers.retrieve(user.subscription.customerId);
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      expand: ['latest_invoice.payment_intent'],
    });

  
    user.subscription.subscriptionId = subscription.id;
    user.subscription.expires = new Date(subscription.current_period_end * 1000);
    user.subscription.enrolledCourses.push(courseId);
    await user.save();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${process.env.FRONTEND_URL}/userdash`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}`,
    });

   
    res.redirect(303, session.url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

