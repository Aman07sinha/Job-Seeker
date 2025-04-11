import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Utils/db.js";
import userRoute from "./routes/user.route.js";
dotenv.config({});
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";



const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:5173",
    Credentials:true
}
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.use("/api/v1/user",userRoute);
app.use("/api/v1/company",companyRoute);
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",applicationRoute);





// http://localhost:8000/apiv1/user/register
// http://localhost:8000/apiv1/user/login
// http://localhost:8000/apiv1/user/profile/update


app.listen(PORT,() =>  {
    connectDB();
    console.log(`Server running at port ${PORT}`);
}) 
