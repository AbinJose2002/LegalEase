import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const token = localStorage.getItem("advocatetoken");
            const response = await axios.get("http://localhost:8080/api/blogs/myblogs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(response.data.blogs);
        } catch (error) {
            setError("Error fetching blogs");
            console.error(error);
        }
    };

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("advocatetoken");
            await axios.post(
                "http://localhost:8080/api/blogs/create",
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchBlogs(); // Refresh blog list
            setTitle("");
            setContent("");
        } catch (error) {
            setError("Error creating blog");
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">My Blogs</h2>

            {/* Blog Form */}
            <div className="card shadow p-4 mt-3">
                <h4>Create a New Blog</h4>
                <form onSubmit={handleCreateBlog}>
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Blog Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <textarea className="form-control" rows="4" placeholder="Blog Content" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-success w-100">Create Blog</button>
                </form>
            </div>

            {error && <p className="text-danger text-center mt-3">{error}</p>}

            {/* Display Blogs */}
            <h3 className="mt-4">All Blogs</h3>
            {blogs.length === 0 ? (
                <p className="text-center text-muted">No blogs found</p>
            ) : (
                <div className="row">
                    {blogs.map((blog) => (
                        <div key={blog._id} className="col-md-6">
                            <div className="card shadow p-3 mt-3">
                                <h4>{blog.title}</h4>
                                <p>{blog.content}</p>
                                <small className="text-muted">Created on: {new Date(blog.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
