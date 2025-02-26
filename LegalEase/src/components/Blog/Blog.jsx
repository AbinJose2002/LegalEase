import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/blogs/all");
        setBlogPosts(response.data.blogs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blog posts");
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="py-5 bg-light" id="blog">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Latest from Our Blog</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Stay updated with our latest articles, tutorials, and insights about web development and design.
          </p>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : (
          <div className="row g-4">
            {blogPosts.map((post) => (
              <div key={post._id} className="col-md-4">
                <div className="card h-100 p-4">
                  
                  <div className="card-body">
                    <small className="text-muted">{new Date(post.createdAt).toLocaleDateString()}</small>
                    <h5 className="card-title mt-2">{post.title}</h5>
                    <p className="card-text">{post.content.substring(0, 100)}...</p>
                    {/* <p className="text-muted mb-2">Written by: <b>{post.advocate?.name || "Unknown"}</b></p> */}
                    <Link to={`/blog/${post._id}`} className="text-primary text-decoration-none">
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <Link 
            to="/blog" 
            className="btn btn-outline-primary d-inline-flex align-items-center"
          >
            View More Blog Posts
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
