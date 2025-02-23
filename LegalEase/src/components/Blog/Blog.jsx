import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with React",
      description: "Learn the basics of React and start building modern web applications",
      date: "April 15, 2024",
      image: "/blog-1.jpg",
      author: "John Doe"
    },
    {
      id: 2,
      title: "CSS Best Practices", 
      description: "Discover the latest CSS techniques and best practices for modern web development",
      date: "April 12, 2024",
      image: "/blog-2.jpg",
      author: "Jane Smith"
    },
    {
      id: 3,
      title: "JavaScript Tips & Tricks",
      description: "Enhance your JavaScript skills with these essential tips and tricks",
      date: "April 10, 2024",
      image: "/blog-3.jpg",
      author: "Mike Johnson"
    }
  ];

  return (
    <section className="py-5 bg-light" id='blog'>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Latest from Our Blog</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Stay updated with our latest articles, tutorials, and insights about web development and design.
          </p>
        </div>

        <div className="row g-4">
          {blogPosts.map((post) => (
            <div key={post.id} className="col-md-4">
              <div className="card h-100 p-4">
                <img 
                  src={post.image} 
                  className="card-img-top" 
                  alt={post.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <small className="text-muted">{post.date}</small>
                  <h5 className="card-title mt-2">{post.title}</h5>
                  <p className="card-text">{post.description}</p>
                  <p className="text-muted mb-2">Written by: {post.author}</p>
                  <Link to={`/blog/${post.id}`} className="text-primary text-decoration-none">
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

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
