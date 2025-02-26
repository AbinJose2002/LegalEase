import BlogModel from "../model/BlogModel.js";
import AdvocateModel from "../model/AdvocateModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const getAdvocateId = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogModel.find()// Populate advocate details

        res.status(200).json({ blogs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs", error });
    }
};

export const createBlog = async (req, res) => {
    const advocateId = getAdvocateId(req);
    if (!advocateId) return res.status(401).json({ message: "Unauthorized" });

    const { title, content } = req.body;
    try {
        const blog = new BlogModel({ title, content, advocateId });
        await blog.save();
        res.status(201).json({ message: "Blog created successfully", blog });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating blog", error });
    }
};

export const getAdvocateBlogs = async (req, res) => {
    const advocateId = getAdvocateId(req);
    if (!advocateId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const blogs = await BlogModel.find({ advocateId });
        res.status(200).json({ blogs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs", error });
    }
};