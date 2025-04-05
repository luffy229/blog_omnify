import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

// Create base URL for API calls
const API_URL = process.env.REACT_APP_API_URL || '/api';

const UserBlogsScreen = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const BLOGS_PER_PAGE = 6;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserBlogs = async () => {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        const { data } = await axios.get(
          `${API_URL}/blogs/user?page=${page}&limit=${BLOGS_PER_PAGE}`,
          config
        );
        
        setBlogs(data.blogs || []);
        setHasMore(data.hasMore);
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

    fetchUserBlogs();
  }, [user, navigate]);

  // Load more blogs
  const loadMoreBlogs = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.get(
        `${API_URL}/blogs/user?page=${nextPage}&limit=${BLOGS_PER_PAGE}`,
        config
      );
      
      const newBlogs = data.blogs || [];
      
      if (newBlogs.length > 0) {
        setBlogs([...blogs, ...newBlogs]);
        setPage(nextPage);
        setHasMore(data.hasMore);
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

  return (
    <div className="user-blogs-page">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>My Blogs</h1>
        </Col>
        <Col xs="auto">
          <LinkContainer to="/create-blog">
            <Button variant="primary">
              <i className="fas fa-plus-circle me-2"></i> Create New Blog
            </Button>
          </LinkContainer>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : blogs.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <div className="mb-4">
              <i className="fas fa-pencil-alt fa-4x text-muted"></i>
            </div>
            <h4>You haven't written any blogs yet</h4>
            <p className="text-muted">
              Start sharing your thoughts and ideas with the world!
            </p>
            <LinkContainer to="/create-blog">
              <Button variant="primary">
                Write Your First Blog
              </Button>
            </LinkContainer>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            {blogs.map((blog) => (
              <Col key={blog._id} md={6} lg={4} className="mb-4">
                <BlogCard blog={blog} />
              </Col>
            ))}
          </Row>
          
          {hasMore && (
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
      )}
    </div>
  );
};

export default UserBlogsScreen; 