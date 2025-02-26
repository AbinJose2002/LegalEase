import express from "express";
import { createBlog, getAdvocateBlogs, getAllBlogs } from "../controller/BlogController.js";

const blogRouter = express.Router();

blogRouter.post("/create", createBlog);
blogRouter.get("/myblogs", getAdvocateBlogs);
blogRouter.get("/all", getAllBlogs);

export default blogRouter;
