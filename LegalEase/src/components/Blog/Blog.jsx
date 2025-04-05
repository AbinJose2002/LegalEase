import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Blog.css';
import { FaArrowRight, FaClock, FaUser } from 'react-icons/fa';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
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

  // Function to format date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <section className="blog-section py-5" id="blog">
      <div className="pattern-overlay"></div>
      <div className="container position-relative">
        <div className={`text-center mb-5 fade-in ${isVisible ? 'visible' : ''}`}>
          <p className="pre-title">Insights & Resources</p>
          <h2 className="section-title mb-3">
            Latest from Our <span className="highlight">Blog</span>
          </h2>
          <p className="section-description mx-auto">
            Stay updated with our latest articles, tutorials, and insights about legal practices and industry trends.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading the latest articles...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <p className="error-message">{error}</p>
            <button className="btn retry-btn" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {blogPosts.map((post, index) => (
              <div 
                key={post._id} 
                className="col-md-4 fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="blog-card h-100">
                  <div className="blog-card-body">
                    <div className="blog-meta">
                      <span className="blog-date">
                        <FaClock className="meta-icon" /> {formatDate(post.createdAt)}
                      </span>
                      {post.advocate?.name && (
                        <span className="blog-author">
                          <FaUser className="meta-icon" /> {post.advocate.name}
                        </span>
                      )}
                    </div>
                    <h3 className="blog-title">{post.title}</h3>
                    <p className="blog-excerpt">{post.content.substring(0, 120)}...</p>
                    <Link to={`/blog/${post._id}`} className="blog-read-more">
                      Read More <FaArrowRight className="read-more-icon" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`text-center mt-5 fade-in ${isVisible ? 'visible' : ''}`}>
          <Link 
            to="/blog" 
            className="view-all-btn"
          >
            View More Blog Posts
            <FaArrowRight className="ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
