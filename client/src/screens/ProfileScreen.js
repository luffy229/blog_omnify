import React, { useState, useContext, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import axios from 'axios';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setName(user.name || '');
    setEmail(user.email || '');
    setAvatar(user.avatar || '');
    setBio(user.bio || '');
    setLocation(user.location || '');
  }, [navigate, user]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (imageError) {
      setMessage(imageError);
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccess(false);
    
    // Prepare update data
    const userData = {
      name,
      email,
      bio,
      location,
      avatar
    };
    
    const result = await updateProfile(userData);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  // Image compression function
  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const imgElement = new window.Image();
        imgElement.src = event.target.result;
        
        imgElement.onload = () => {
          const canvas = document.createElement('canvas');
          let width = imgElement.width;
          let height = imgElement.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgElement, 0, 0, width, height);
          
          // Get compressed image as Data URL
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        
        imgElement.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImageError('');
    
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    // Check file size (max 5MB before compression)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      // Don't reject, just show a warning that we'll compress
      console.log('File is large, will be compressed');
    }
    
    try {
      // Compress image
      const compressedImageData = await compressImage(file, 800, 800, 0.7);
      
      // Check if the compressed image is still too large (> 1MB)
      const base64Size = compressedImageData.length * (3/4) - 
                        compressedImageData.match(/=+$/g)?.length || 0;
                        
      if (base64Size > 1024 * 1024) {
        // Try compressing more
        const furtherCompressedImage = await compressImage(file, 400, 400, 0.5);
        setAvatar(furtherCompressedImage);
      } else {
        setAvatar(compressedImageData);
      }
      
    } catch (error) {
      console.error('Error compressing image:', error);
      setImageError('Error processing image. Please try another image.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.delete('http://localhost:5000/api/users/profile', config);
      
      // Close modal
      setShowDeleteModal(false);
      
      // Log user out
      await logout();
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to delete account. Please try again.'
      );
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Row className="justify-content-md-center my-3">
      <Col md={8}>
        <Card className="profile-card border-0 shadow-sm">
          <Card.Header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="fas fa-user-edit me-2"></i> Edit Profile
            </h2>
            <Link to="/security" className="btn btn-light">
              <i className="fas fa-shield-alt me-1"></i> Security Settings
            </Link>
          </Card.Header>
          <Card.Body className="p-4">
            {message && <Alert variant="danger">{message}</Alert>}
            {imageError && <Alert variant="warning">{imageError}</Alert>}
            {success && (
              <Alert variant="success">
                Profile updated successfully!
              </Alert>
            )}
            {loading ? (
              <Loader />
            ) : (
              <Form onSubmit={submitHandler}>
                <Row>
                  <Col md={4} className="text-center mb-4">
                    <div className="avatar-wrapper mb-3">
                      <Image 
                        src={avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                        alt={name} 
                        roundedCircle 
                        className="profile-avatar shadow"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                    <Form.Group controlId="avatar" className="mb-3">
                      <Form.Label className="btn btn-outline-primary">
                        <i className="fas fa-camera me-2"></i>
                        Change Photo
                        <Form.Control
                          type="file"
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="d-none"
                        />
                      </Form.Label>
                      <div className="text-muted small mt-1">
                        Recommended: JPG, PNG up to 5MB
                      </div>
                    </Form.Group>
                  </Col>
                  
                  <Col md={8}>
                    <Form.Group controlId="name" className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="email" className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="location" className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fas fa-map-marker-alt"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Your location (e.g. New York, USA)"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="bio" className="mb-4">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tell us about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Share a brief description about yourself that will appear on your profile
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-3 mb-3">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    className="flex-grow-1"
                    disabled={loading}
                  >
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </Button>
                  
                  <Button 
                    variant="outline-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteModal(true);
                    }}
                    size="lg"
                  >
                    <i className="fas fa-user-slash me-2"></i>
                    Delete Account
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
      
      {/* Delete Account Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Delete Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="danger">
            <p className="mb-2"><strong>Warning:</strong> This action cannot be undone!</p>
            <p>Deleting your account will:</p>
            <ul>
              <li>Permanently remove all your personal information</li>
              <li>Delete all your blog posts, comments, and interactions</li>
              <li>Remove you from all conversations and notifications</li>
            </ul>
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>Type <strong>DELETE</strong> to confirm:</Form.Label>
            <Form.Control
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash-alt me-2"></i>
                Permanently Delete Account
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default ProfileScreen; 