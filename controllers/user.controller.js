import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const {fullname, email, phoneNumber, password, role} = req.body;
        // enme se koi ek khali rh gya tb uske liye not opertaor
        if(!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                Message:"Something is Missing",
                success:false
            });
        };
        const existinguser = await User.findOne({email});
        if(existinguser) {
            return res.status(400).json({
                Message:"User already exist with this email",
                success:false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password:hashedPassword,
            role,
        });

        return res.status(201).json({
            message:"Account created successfully..",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        const {email, password, role } = req.body;
        if(!email || !password || !role) {
            return res.status(400).json({
                Message:"Something is Missing",
                success:false
            });
        };
        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                Message:"Incorrect Email or password",
                success:false,
            });
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return res.status(400).json({
                Message:"Incorrect Email or password",
                success:false,
            });
        };
        // check role is correct or not
        if(role != user.role) {
            return res.status(400).json({
                Message:"Account dosen't exist with ",
                success:false,
            });
        };

        const tokenData = {
            userId:user._id
        }
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });


        user = {
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            phoneNumber:user.phoneNumber,
            role:user.role,
            profile:user.profile
        }

        return res.status(200).cookie("token", token, {maxAge:1*24*60*60*1000, httponly:true, saveSize: 'strict'}).json({
            message:`Welcome back ${user.fullname}`,
            success:true
        })
    } catch (error) {
        console.log(error);

    }
}

export const logout = async(req, res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully..",
            success:true
        }) 
    } catch (error) {
        console.log(error);
        
    };
}

export const updateProfile = async(req, res) => {
    try {

        const {fullname, email, phoneNumber, bio, skills} = req.body;
        const file = req.file;

        // ye jaruri nhi h ki sb chiz update kr rhe ho
        // if(!fullname || !email || !phoneNumber || !bio || !skills) {
        //     return res.status(400).json({
        //         Message:"Something is Missing",
        //         success:false
        //     });
        // };

        // cloudinary aae ga idhar

        let skillsArray;
        if(skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.id;
        let user = await User.findById(userId);

        // middleware authentication

        if(!user) {
            return res.status(400).json({
                message:"User not found.",
                success:false
            })
        }

        // updating data

        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber) user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray        

        // resume comes late here

        await user.save();

        user = {
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            phoneNumber:user.phoneNumber,
            role:user.role,
            profile:user.profile
        }

        return res.status(200).json({
            message:"Profile Updated successfully..",
            user,
            success:true
        })
  
    } catch (error) {
        console.log(error);
        
    };
}