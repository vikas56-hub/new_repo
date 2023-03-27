import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from "mongoose";
import router from './router/route.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
// const DATABASE='mongodb+srv://vcvansh:gcoTYykcocG1wu5N@demo.kyjm8mh.mongodb.net/lawkit?appName=mongosh+1.7.1',

// db
mongoose.set('strictQuery', false);
mongoose
  .connect(process.process.env.DATABASE)
  .then(() => console.log("**DB CONNECTED**"))
  .catch((err) => console.log("DB CONNECTION ERR => ", err));

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack



/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
});


/** api routes */
app.use('/api', router)


// port

const port = process.process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
