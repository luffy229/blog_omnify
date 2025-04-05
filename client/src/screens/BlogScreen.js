import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Card, Badge, Form, ListGroup, Image } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { AuthContext } from '../context/AuthContext';

const BlogScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  
  const commentInputRef = useRef(null);
  const replyInputRef = useRef(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(data);
        setLikesCount(data.likes.length);
        
        // Check if user has liked this blog
        if (user) {
          checkLikeStatus();
        }
        
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

    fetchBlog();
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [id, user]);

  // Check if user has liked this blog
  const checkLikeStatus = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/blogs/${id}/like/check`,
        config
      );
      
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        await axios.delete(`http://localhost:5000/api/blogs/${id}`, config);
        navigate('/');
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
      }
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `http://localhost:5000/api/blogs/${id}/like`,
        {},
        config
      );
      
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const submitCommentHandler = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) {
      return;
    }
    
    setCommentLoading(true);
    setCommentError(null);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `http://localhost:5000/api/blogs/${id}/comments`,
        { text: comment },
        config
      );
      
      // Update blog with new comments
      setBlog({
        ...blog,
        comments: data
      });
      
      setComment('');
      setCommentLoading(false);
      
      // Scroll to comment input
      if (commentInputRef.current) {
        commentInputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      setCommentError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setCommentLoading(false);
    }
  };

  const deleteCommentHandler = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.delete(
          `http://localhost:5000/api/blogs/${id}/comments/${commentId}`,
          config
        );
        
        // Update blog with updated comments
        setBlog({
          ...blog,
          comments: data
        });
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  // Handle replying to a comment
  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
    
    // Focus the reply input after state update
    setTimeout(() => {
      if (replyInputRef.current) {
        replyInputRef.current.focus();
      }
    }, 100);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  // Submit a reply to a comment
  const submitReplyHandler = async (e, commentId) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!replyText.trim()) {
      return;
    }
    
    setReplyLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `http://localhost:5000/api/blogs/${id}/comments/${commentId}/replies`,
        { text: replyText },
        config
      );
      
      // Update blog with the updated comment that includes the new reply
      const updatedComments = blog.comments.map(comment => 
        comment._id === data._id ? data : comment
      );
      
      setBlog({
        ...blog,
        comments: updatedComments
      });
      
      setReplyText('');
      setReplyingTo(null);
      setReplyLoading(false);
    } catch (error) {
      console.error('Error adding reply:', error);
      setReplyLoading(false);
    }
  };

  // Delete a reply
  const deleteReplyHandler = async (commentId, replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.delete(
          `http://localhost:5000/api/blogs/${id}/comments/${commentId}/replies/${replyId}`,
          config
        );
        
        // Update blog with the updated comment that has the reply removed
        const updatedComments = blog.comments.map(comment => 
          comment._id === data._id ? data : comment
        );
        
        setBlog({
          ...blog,
          comments: updatedComments
        });
      } catch (error) {
        console.error('Error deleting reply:', error);
      }
    }
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = blog?.title || 'Check out this blog post';
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="blog-detail-page">
      <Link to="/" className="btn btn-light my-3">
        <i className="fas fa-arrow-left me-1"></i> Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : blog ? (
        <>
          <Card className="blog-detail-card border-0 shadow-sm mb-4">
            <Card.Body className="p-3 p-md-5">
              <Row>
                <Col md={12}>
                  <div className="blog-meta mb-3 mb-md-4">
                    <div className="d-flex flex-wrap align-items-center mb-3">
                      {blog.author && (
                        <div className="d-flex align-items-center mb-2 mb-sm-0 me-auto">
                          <div className="avatar me-2 me-md-3">
                            {blog.author.avatar ? (
                              <Link to={`/user/${blog.author._id}`}>
                                <Image 
                                  src={blog.author.avatar} 
                                  alt={blog.author.name} 
                                  width="40" 
                                  height="40" 
                                  className="d-none d-sm-block" 
                                  roundedCircle 
                                  style={{ objectFit: 'cover' }} 
                                />
                                <Image 
                                  src={blog.author.avatar} 
                                  alt={blog.author.name} 
                                  width="32" 
                                  height="32" 
                                  className="d-block d-sm-none" 
                                  roundedCircle 
                                  style={{ objectFit: 'cover' }} 
                                />
                              </Link>
                            ) : (
                              <i className="fas fa-user-circle fa-2x fa-sm-3x text-primary"></i>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-0 fs-6">
                              <Link 
                                to={`/user/${blog.author._id}`} 
                                className="text-decoration-none text-dark"
                              >
                                {blog.author.name}
                              </Link>
                            </h6>
                            <small className="text-muted">
                              <i className="far fa-calendar-alt me-1"></i> 
                              {formatDate(blog.createdAt)}
                            </small>
                          </div>
                        </div>
                      )}
                      <div className="d-flex flex-wrap">
                        <Badge bg="light" text="dark" className="px-2 py-1 px-md-3 py-md-2 me-2 mb-2 mb-md-0">
                          <i className="far fa-eye me-1"></i> {blog.viewCount} views
                        </Badge>
                        <Badge bg="light" text="dark" className="px-2 py-1 px-md-3 py-md-2">
                          <i className="far fa-clock me-1"></i>
                          {blog.readTime || 1} min read
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <h1 className="blog-title mb-3 mb-md-4 fs-4 fs-md-2">{blog.title}</h1>
                
                  <div className="blog-content mt-3 mt-md-4">
                    {blog.content.split('\n').map((paragraph, index) => (
                      paragraph ? <p key={index} className="mb-3">{paragraph}</p> : <br key={index} />
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>

            <Card.Footer className="bg-white py-3 border-top">
              <Row>
                <Col>
                  <div className="d-flex flex-wrap align-items-center">
                    <div className="d-flex align-items-center me-3 mb-2 mb-md-0">
                      <Button 
                        variant="light" 
                        className="me-2 rounded-circle p-1 p-md-2" 
                        onClick={handleLike}
                      >
                        <i className={`${liked ? 'fas' : 'far'} fa-heart ${liked ? 'text-danger' : ''}`}></i>
                      </Button>
                      <span className="text-nowrap">{likesCount} likes</span>
                    </div>
                    
                    <div className="ms-auto d-flex">
                      <Button 
                        variant="light" 
                        className="me-2 rounded-circle p-1 p-md-2"
                        onClick={shareOnTwitter}
                      >
                        <i className="fab fa-twitter"></i>
                      </Button>
                      <Button 
                        variant="light" 
                        className="me-2 rounded-circle p-1 p-md-2"
                        onClick={shareOnFacebook}
                      >
                        <i className="fab fa-facebook-f"></i>
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
          
          {/* Comments Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-3 p-md-4">
              <h4 className="mb-3 mb-md-4 fs-5 fs-md-4">
                <i className="far fa-comments me-2"></i>
                Comments ({blog.comments.length})
              </h4>
              
              {user ? (
                <Form onSubmit={submitCommentHandler} className="mb-3 mb-md-4" ref={commentInputRef}>
                  <Form.Group controlId="comment">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="mb-2"
                    />
                  </Form.Group>
                  {commentError && <Message variant="danger">{commentError}</Message>}
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm"
                    disabled={commentLoading || !comment.trim()}
                    className="mt-2"
                  >
                    {commentLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>Post Comment</>
                    )}
                  </Button>
                </Form>
              ) : (
                <div className="alert alert-info py-2 py-md-3">
                  Please <Link to="/login">sign in</Link> to post a comment
                </div>
              )}
              
              {blog.comments.length === 0 ? (
                <div className="text-center p-3 p-md-4">
                  <i className="far fa-comment-dots fa-2x fa-md-3x mb-2 mb-md-3 text-muted"></i>
                  <p className="text-muted mb-0">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {blog.comments.map((comment) => (
                    <ListGroup.Item key={comment._id} className="border-bottom py-3 px-0">
                      <div className="d-flex">
                        <div className="me-2 me-md-3">
                          {comment.user && (
                            <Link to={`/user/${comment.user}`}>
                              {comment.avatar ? (
                                <Image 
                                  src={comment.avatar} 
                                  alt={comment.name} 
                                  width="32" 
                                  height="32" 
                                  className="d-block d-md-none" 
                                  roundedCircle 
                                  style={{ objectFit: 'cover' }} 
                                />
                              ) : (
                                <i className="fas fa-user-circle fa-2x text-secondary d-none d-md-block"></i>
                              )}
                              {comment.avatar ? (
                                <Image 
                                  src={comment.avatar} 
                                  alt={comment.name} 
                                  width="40" 
                                  height="40" 
                                  className="d-none d-md-block" 
                                  roundedCircle 
                                  style={{ objectFit: 'cover' }} 
                                />
                              ) : (
                                <i className="fas fa-user-circle text-secondary d-block d-md-none"></i>
                              )}
                            </Link>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-2">
                            <h6 className="mb-0 fs-6">
                              {comment.user ? (
                                <Link 
                                  to={`/user/${comment.user}`} 
                                  className="text-decoration-none text-dark"
                                >
                                  {comment.name}
                                </Link>
                              ) : (
                                comment.name
                              )}
                            </h6>
                            <small className="text-muted mt-1 mt-sm-0">
                              {formatDate(comment.createdAt)}
                            </small>
                          </div>
                          <p className="mb-1">{comment.text}</p>
                          
                          <div className="d-flex flex-wrap mt-2 mb-3">
                            {user && (
                              <Button
                                variant="link"
                                className="p-0 text-primary me-3 mb-2 mb-sm-0"
                                onClick={() => handleReplyClick(comment._id)}
                              >
                                <i className="fas fa-reply me-1"></i> Reply
                              </Button>
                            )}
                            
                            {user && user._id === comment.user.toString() && (
                              <Button
                                variant="link"
                                className="p-0 text-danger"
                                onClick={() => deleteCommentHandler(comment._id)}
                              >
                                <i className="fas fa-trash-alt me-1"></i> Delete
                              </Button>
                            )}
                          </div>
                          
                          {/* Reply Form */}
                          {user && replyingTo === comment._id && (
                            <Form 
                              onSubmit={(e) => submitReplyHandler(e, comment._id)} 
                              className="mb-3 ms-3 ms-md-4 border-start ps-2 ps-md-3"
                            >
                              <Form.Group controlId={`reply-${comment._id}`}>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="mb-2 py-2"
                                  style={{ fontSize: '0.9rem' }}
                                  ref={replyInputRef}
                                />
                              </Form.Group>
                              <div>
                                <Button 
                                  type="submit" 
                                  variant="primary" 
                                  size="sm"
                                  className="me-2"
                                  disabled={replyLoading || !replyText.trim()}
                                >
                                  {replyLoading ? (
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  ) : null} 
                                  {replyLoading ? 'Posting...' : 'Post Reply'}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="light" 
                                  size="sm"
                                  onClick={cancelReply}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </Form>
                          )}
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-section ms-3 ms-md-4 mt-3 border-start ps-2 ps-md-3">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="reply mb-3">
                                  <div className="d-flex">
                                    <div className="me-2">
                                      {reply.user && (
                                        <Link to={`/user/${reply.user}`}>
                                          {reply.avatar ? (
                                            <Image 
                                              src={reply.avatar} 
                                              alt={reply.name} 
                                              width="25"
                                              height="25" 
                                              roundedCircle 
                                              style={{ objectFit: 'cover' }} 
                                            />
                                          ) : (
                                            <i className="fas fa-user-circle fs-5 text-secondary"></i>
                                          )}
                                        </Link>
                                      )}
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                                        <h6 className="mb-0 fs-6 fw-normal">
                                          {reply.user ? (
                                            <Link 
                                              to={`/user/${reply.user}`} 
                                              className="text-decoration-none text-dark"
                                            >
                                              {reply.name}
                                            </Link>
                                          ) : (
                                            reply.name
                                          )}
                                        </h6>
                                        <small className="text-muted mt-1 mt-sm-0 fs-smaller">
                                          {formatDate(reply.createdAt)}
                                        </small>
                                      </div>
                                      <p className="mb-1 small">{reply.text}</p>
                                      
                                      {user && user._id === reply.user.toString() && (
                                        <Button
                                          variant="link"
                                          className="p-0 text-danger small"
                                          onClick={() => deleteReplyHandler(comment._id, reply._id)}
                                        >
                                          <i className="fas fa-trash-alt me-1"></i> Delete
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
          
          {user && blog.author && user._id === blog.author._id && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-3 p-md-4">
                <h5 className="mb-3 fs-6 fs-md-5">Blog Management</h5>
                <div className="d-flex flex-column flex-sm-row">
                  <Link
                    to={`/blog/${blog._id}/edit`}
                    className="btn btn-primary btn-sm mb-2 mb-sm-0 me-sm-2"
                  >
                    <i className="fas fa-edit me-1"></i> Edit Blog
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={deleteHandler}
                  >
                    <i className="fas fa-trash-alt me-1"></i> Delete Blog
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      ) : (
        <Message>Blog not found</Message>
      )}
    </div>
  );
};

export default BlogScreen; 