import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Link } from 'react-router-dom';

// Create base URL for API calls
const API_URL = process.env.REACT_APP_API_URL || '/api';

const HomeScreen = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const BLOGS_PER_PAGE = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/blogs?page=1&limit=${BLOGS_PER_PAGE}`);
        
        // Handle the response based on its structure
        const blogsArray = data.blogs || data;
        
        setBlogs(blogsArray);
        setFilteredBlogs(blogsArray);
        setHasMore(data.hasMore || blogsArray.length >= BLOGS_PER_PAGE);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Load more blogs
  const loadMoreBlogs = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const { data } = await axios.get(
        `${API_URL}/blogs?page=${nextPage}&limit=${BLOGS_PER_PAGE}`
      );
      
      const newBlogs = data.blogs || data;
      
      if (newBlogs.length > 0) {
        if (searchTerm) {
          // If there's a search term, filter the new blogs
          const filtered = newBlogs.filter(
            (blog) =>
              blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (blog.author && blog.author.name && blog.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          
          setFilteredBlogs([...filteredBlogs, ...filtered]);
        } else {
          setFilteredBlogs([...filteredBlogs, ...newBlogs]);
        }
        
        setBlogs([...blogs, ...newBlogs]);
        setPage(nextPage);
        setHasMore(data.hasMore || newBlogs.length >= BLOGS_PER_PAGE);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoadingMore(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredBlogs(blogs);
      return;
    }
    
    const filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.author && blog.author.name && blog.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredBlogs(filtered);
  };

  return (
    <>
      <div className="home-hero mb-5 py-5">
        <Row className="align-items-center">
          <Col md={7}>
            <h1 className="display-4 fw-bold mb-4">Welcome to Our Blog Platform</h1>
            <p className="lead mb-4">
              Discover insightful articles, share your own stories, and connect with our community
              of writers and readers.
            </p>
            <div className="d-flex gap-3">
              <Link to="/create-blog" className="btn btn-primary btn-lg">
                <i className="fas fa-pen me-2"></i> Write a Blog
              </Link>
              <Button variant="outline-secondary" size="lg" href="#blogs">
                <i className="fas fa-book-open me-2"></i> Explore Blogs
              </Button>
            </div>
          </Col>
          <Col md={5} className="d-none d-md-block">
            <div className="blog-illustration text-center">
              <i className="fas fa-feather-alt fa-8x text-primary opacity-75"></i>
            </div>
          </Col>
        </Row>
      </div>

      <h2 className="mb-4" id="blogs">Latest Blogs</h2>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search blogs by title, content or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="primary">
            <i className="fas fa-search"></i>
          </Button>
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setSearchTerm('');
                setFilteredBlogs(blogs);
              }}
            >
              <i className="fas fa-times"></i>
            </Button>
          )}
        </InputGroup>
      </Form>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : filteredBlogs && filteredBlogs.length === 0 ? (
        <div className="text-center my-5 py-5">
          <i className="fas fa-search fa-3x mb-4 text-muted"></i>
          <h4 className="text-muted">No blogs found matching your search</h4>
          {searchTerm && (
            <Button 
              variant="outline-primary" 
              className="mt-3"
              onClick={() => {
                setSearchTerm('');
                setFilteredBlogs(blogs);
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : Array.isArray(filteredBlogs) ? (
        <>
          <Row>
            {filteredBlogs.map((blog) => (
              <Col key={blog._id} md={6} lg={4} className="mb-4">
                <BlogCard blog={blog} />
              </Col>
            ))}
          </Row>
          
          {hasMore && !searchTerm && (
            <div className="text-center my-4">
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={loadMoreBlogs}
                disabled={loadingMore}
                className="px-5 load-more-btn"
              >
                {loadingMore ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-2"></i>
                    Load More
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Message variant="danger">Invalid blog data received from server</Message>
      )}
    </>
  );
};

export default HomeScreen; 