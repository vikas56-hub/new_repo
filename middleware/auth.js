import jwt from 'jsonwebtoken';


/** auth middleware */
export default async function Auth(req, res, next){
    try {
        
        // access authorize header to validate request
        const token = req.headers.authorization.split(" ")[1];

        // retrive the user details fo the logged in user
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;

        next()

    } catch (error) {
        res.status(401).json({ error : "Authentication Failed!"})
    }
}


export function localVariables(req, res, next){
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
    next()
}


export const isEnrolled = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).exec();
      const course = await Course.findOne({ slug: req.params.slug }).exec();
  
      // check if course id is found in user courses array
      let ids = [];
      for (let i = 0; i < user.courses.length; i++) {
        ids.push(user.courses[i].toString());
      }
  
      if (!ids.includes(course._id.toString())) {
        res.sendStatus(403);
      } else {
        next();
      }
    } catch (err) {
      console.log(err);
    }
  };
  



