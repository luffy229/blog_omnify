import React, { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

const EditBlogScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        
        // Verify if user is the author of the blog
        if (user._id !== data.author._id) {
          navigate('/');
          return;
        }
        
        setTitle(data.title);
        setContent(data.content);
        setLoadingFetch(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        setLoadingFetch(false);
      }
    };

    fetchBlog();
  }, [id, user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(
        `http://localhost:5000/api/blogs/${id}`,
        { title, content },
        config
      );

      setLoading(false);
      navigate(`/blog/${id}`);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Edit Blog</h1>
      {loadingFetch ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {loading && <Loader />}
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="title" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="content" className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Update
            </Button>
          </Form>
        </>
      )}
    </>
  );
};

export default EditBlogScreen; 