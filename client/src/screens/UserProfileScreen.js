import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import Message from '../components/Message';
import BlogCard from '../components/BlogCard';

const UserProfileScreen = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);

  // Fetch user details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data } = await axios.get(`http://localhost:5000/api/users/${id}`);
        setProfileUser(data);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  // Fetch user's blogs
  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        setBlogsLoading(true);
        setBlogsError(null);
        
        const { data } = await axios.get(`http://localhost:5000/api/blogs/user/${id}`);
        setUserBlogs(data);
      } catch (error) {
        setBlogsError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
      } finally {
        setBlogsLoading(false);
      }
    };
    
    if (id) {
      fetchUserBlogs();
    }
  }, [id]);

  // Format join date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isOwnProfile = user && profileUser && user._id === profileUser._id;

  return (
    <div className="user-profile-page">
      <Link to="/" className="btn btn-light my-3">
        <i className="fas fa-arrow-left me-1"></i> Go Back
      </Link>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : profileUser ? (
        <>
          <Row>
            <Col md={4}>
              <Card className="profile-summary-card border-0 shadow-sm mb-4">
                <Card.Body className="text-center p-4">
                  <div className="mb-4">
                    <Image 
                      src={profileUser.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                      alt={profileUser.name} 
                      roundedCircle 
                      className="profile-avatar shadow"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <h3 className="mb-2">{profileUser.name}</h3>
                  
                  {profileUser.location && (
                    <p className="text-muted mb-3">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {profileUser.location}
                    </p>
                  )}
                  
                  <p className="text-muted small">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Joined {formatDate(profileUser.createdAt)}
                  </p>
                  
                  {profileUser.bio && (
                    <div className="bio-section border-top pt-3 mt-3 text-start">
                      <h5 className="mb-3">About</h5>
                      <p>{profileUser.bio}</p>
                    </div>
                  )}
                  
                  {isOwnProfile && (
                    <div className="mt-4">
                      <Link to="/profile" className="btn btn-primary">
                        <i className="fas fa-edit me-1"></i> Edit Profile
                      </Link>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">
                      <i className="fas fa-pencil-alt me-2"></i> 
                      {profileUser.name}'s Blogs
                    </h3>
                    <Badge bg="primary" className="py-2 px-3">
                      {userBlogs.length} {userBlogs.length === 1 ? 'Blog' : 'Blogs'}
                    </Badge>
                  </div>
                  
                  {blogsLoading ? (
                    <Loader />
                  ) : blogsError ? (
                    <Message variant="danger">{blogsError}</Message>
                  ) : userBlogs.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                      <h5>No blogs published yet</h5>
                      <p className="text-muted">
                        {isOwnProfile 
                          ? "You haven't published any blogs yet. Start creating your first blog!" 
                          : `${profileUser.name} hasn't published any blogs yet.`}
                      </p>
                      
                      {isOwnProfile && (
                        <Link to="/create-blog" className="btn btn-primary mt-2">
                          <i className="fas fa-plus-circle me-1"></i> Create New Blog
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Row>
                      {userBlogs.map(blog => (
                        <Col sm={12} key={blog._id} className="mb-4">
                          <BlogCard blog={blog} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Message>User not found</Message>
      )}
    </div>
  );
};

export default UserProfileScreen; 