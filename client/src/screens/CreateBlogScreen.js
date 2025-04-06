import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Row, Col, Tab, Nav, Badge, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

const CreateBlogScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('write');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }

    if (isEditMode) {
      // Fetch blog for edit
      const fetchBlog = async () => {
        try {
          setLoadingBlog(true);
          const { data } = await axios.get(`http://localhost:5000/api/blogs/${id}`);
          
          // Check if this user is the author
          if (data.author && data.author._id !== user._id) {
            navigate('/');
            return;
          }
          
          setTitle(data.title);
          setContent(data.content);
          updateWordCountAndReadTime(data.content);
          setLoadingBlog(false);
        } catch (error) {
          setError(
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message
          );
          setLoadingBlog(false);
        }
      };
      
      fetchBlog();
    }
  }, [id, user, navigate, isEditMode]);

  const updateWordCountAndReadTime = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    
    // Calculate reading time (average reading speed: 200 words per minute)
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words.length / wordsPerMinute);
    setReadTime(minutes < 1 ? 1 : minutes);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateWordCountAndReadTime(newContent);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isEditMode) {
        // Update blog
        await axios.put(
          `http://localhost:5000/api/blogs/${id}`,
          { title, content },
          config
        );
        setSuccessMessage('Blog updated successfully!');
        setTimeout(() => navigate(`/blog/${id}`), 1500);
      } else {
        // Create new blog
        const { data } = await axios.post(
          'http://localhost:5000/api/blogs',
          { title, content },
          config
        );
        setSuccessMessage('Blog created successfully!');
        setTimeout(() => navigate(`/blog/${data._id}`), 1500);
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

  // Switch to preview tab
  const handlePreviewClick = () => {
    if (content) {
      setActiveTab('preview');
    }
  };

  return (
    <div className="create-blog-page">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-3 p-md-4">
              <Row className="align-items-center mb-3 mb-md-4">
                <Col xs={12} sm={6} className="mb-2 mb-sm-0">
                  <h2 className="m-0 fs-3 fs-md-2">{isEditMode ? 'Edit Blog' : 'Create New Blog'}</h2>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="d-flex justify-content-start justify-content-sm-end">
                    <Button 
                      variant={activeTab === 'write' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      className="me-2"
                      onClick={() => setActiveTab('write')}
                    >
                      <i className="fas fa-pen-fancy me-1"></i> 
                      <span className="d-none d-md-inline">Write</span>
                    </Button>
                    <Button 
                      variant={activeTab === 'preview' ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={handlePreviewClick}
                      disabled={!content}
                    >
                      <i className="fas fa-eye me-1"></i> 
                      <span className="d-none d-md-inline">Preview</span>
                    </Button>
                  </div>
                </Col>
              </Row>
              
              {loadingBlog ? (
                <Loader />
              ) : (
                <>
                  {error && <Message variant="danger">{error}</Message>}
                  {successMessage && <Message variant="success">{successMessage}</Message>}
                  
                  <Tab.Content>
                    <Tab.Pane active={activeTab === 'write'}>
                      <Form onSubmit={submitHandler} className="blog-form">
                        <Form.Group controlId="title" className="mb-3 mb-md-4">
                          <Form.Label className="fw-bold">Blog Title</Form.Label>
                          <InputGroup className="mb-2">
                            <InputGroup.Text>
                              <i className="fas fa-heading"></i>
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Enter a compelling title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="border-0 shadow-sm"
                              maxLength={100}
                            />
                          </InputGroup>
                          <div className="d-flex justify-content-end">
                            <small className={`${title.length > 70 ? 'text-warning' : 'text-muted'}`}>
                              {title.length}/100 characters
                            </small>
                          </div>
                        </Form.Group>

                        <Form.Group controlId="content" className="mb-3 mb-md-4">
                          <Form.Label className="fw-bold">Blog Content</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={12}
                            placeholder="Write your blog content here... Use line breaks to create paragraphs."
                            value={content}
                            onChange={handleContentChange}
                            className="blog-editor shadow-sm border-0 p-2 p-md-3"
                            style={{ lineHeight: '1.6', fontSize: '1rem' }}
                          />
                          <div className="d-flex flex-wrap justify-content-between mt-2">
                            <Badge bg="light" text="dark" className="px-2 py-1 px-md-3 py-md-2 mb-2 mb-md-0">
                              <i className="fas fa-font me-1"></i> {wordCount} words
                            </Badge>
                            <Badge bg="light" text="dark" className="px-2 py-1 px-md-3 py-md-2">
                              <i className="far fa-clock me-1"></i> {readTime} min read
                            </Badge>
                          </div>
                        </Form.Group>

                        <div className="d-flex flex-column flex-sm-row justify-content-between mt-3 pt-3 border-top">
                          <Button 
                            type="button" 
                            variant="outline-secondary"
                            onClick={() => navigate('/')}
                            className="mb-2 mb-sm-0"
                            size="sm"
                          >
                            <i className="fas fa-times me-1"></i> Cancel
                          </Button>
                          
                          <div className="d-flex gap-2">
                            <Button
                              type="button"
                              variant="outline-primary"
                              size="sm"
                              onClick={handlePreviewClick}
                              disabled={!content}
                              className="d-md-none"
                            >
                              <i className="fas fa-eye me-1"></i> Preview
                            </Button>
                            
                            <Button
                              type="submit"
                              variant="primary"
                              size="sm"
                              disabled={loading || !title.trim() || !content.trim()}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  <span className="d-none d-md-inline">{isEditMode ? 'Updating...' : 'Publish'}</span>
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-paper-plane me-1"></i> 
                                  <span className="d-none d-md-inline">{isEditMode ? 'Update' : 'Publish'}</span>
                                  <span className="d-inline d-md-none">{isEditMode ? 'Update' : 'Publish'}</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Form>
                    </Tab.Pane>
                    
                    <Tab.Pane active={activeTab === 'preview'}>
                      <div className="blog-preview fade-in">
                        <div className="mb-3 d-flex flex-wrap align-items-center">
                          <Badge bg="primary" className="me-2 px-2 py-1 px-md-3 py-md-2 mb-2">
                            <i className="fas fa-search me-1"></i> Preview
                          </Badge>
                          <Badge bg="light" text="dark" className="me-2 px-2 py-1 px-md-3 py-md-2 mb-2">
                            <i className="far fa-clock me-1"></i> {readTime} min
                          </Badge>
                          <Badge bg="light" text="dark" className="px-2 py-1 px-md-3 py-md-2 mb-2">
                            <i className="far fa-calendar-alt me-1"></i> {new Date().toLocaleDateString()}
                          </Badge>
                        </div>

                        <h1 className="blog-title mb-3 mb-md-4 fs-3 fs-md-2 fw-bold">{title || 'Untitled Blog'}</h1>
                        
                        <div className="blog-preview-author mb-3 mb-md-4 d-flex align-items-center">
                          <div className="avatar me-2 me-md-3">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="rounded-circle"
                                width="40" 
                                height="40" 
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="fas fa-user-circle fa-2x text-primary"></i>
                            )}
                          </div>
                          <div>
                            <div className="fw-bold">{user?.name || 'Author'}</div>
                            <small className="text-muted">Author</small>
                          </div>
                        </div>
                        
                        <div className="blog-content mt-3 mt-md-4">
                          {content.split('\n').map((paragraph, index) => (
                            paragraph ? <p key={index} className="mb-3">{paragraph}</p> : <br key={index} />
                          ))}
                        </div>
                        
                        <div className="d-flex flex-column flex-sm-row justify-content-between mt-3 pt-3 border-top">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setActiveTab('write')}
                            className="mb-2 mb-sm-0"
                          >
                            <i className="fas fa-edit me-1"></i> Back to Editor
                          </Button>
                          
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={submitHandler}
                            disabled={loading || !title.trim() || !content.trim()}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                <span className="d-none d-md-inline">{isEditMode ? 'Updating...' : 'Publishing...'}</span>
                                <span className="d-inline d-md-none">Publishing...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-paper-plane me-1"></i> 
                                <span className="d-none d-md-inline">{isEditMode ? 'Update Blog' : 'Publish Blog'}</span>
                                <span className="d-inline d-md-none">Publish</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </>
              )}
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex align-items-center mb-3">
                <i className="fas fa-lightbulb text-warning me-2 me-md-3 fs-4"></i>
                <h5 className="m-0 fs-6 fs-md-5">Writing Tips</h5>
              </div>
              <ul className="mb-0 writing-tips ps-3 ps-md-4">
                <li><strong>Start with a hook</strong> - Grab your reader's attention from the first paragraph.</li>
                <li><strong>Use short paragraphs</strong> - Keep paragraphs under 3-4 sentences for better readability.</li>
                <li><strong>Add subheadings</strong> - Break up your text with descriptive subheadings.</li>
                <li><strong>Include personal stories</strong> - Share your own experiences to make content relatable.</li>
                <li><strong>End with a call to action</strong> - Give your readers something to do after reading.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateBlogScreen; 