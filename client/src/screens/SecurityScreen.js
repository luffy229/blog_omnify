import React, { useState, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Alert from 'react-bootstrap/Alert';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

const SecurityScreen = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useContext(AuthContext);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage(null);
    setSuccess(false);
    
    // Prepare update data
    const userData = {
      currentPassword,
      password: newPassword
    };
    
    const result = await updateProfile(userData);
    
    if (result.success) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Row className="justify-content-md-center my-3">
      <Col md={8}>
        <Card className="security-card border-0 shadow-sm">
          <Card.Header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="fas fa-shield-alt me-2"></i> Security Settings
            </h2>
            <Link to="/profile" className="btn btn-light">
              <i className="fas fa-user-edit me-1"></i> Back to Profile
            </Link>
          </Card.Header>
          <Card.Body className="p-4">
            {message && <Alert variant="danger">{message}</Alert>}
            {success && (
              <Alert variant="success">
                Password updated successfully!
              </Alert>
            )}
            {loading ? (
              <Loader />
            ) : (
              <Form onSubmit={submitHandler}>
                <h4 className="mb-4">Change Password</h4>
                
                <Form.Group controlId="currentPassword" className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group controlId="newPassword" className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                  >
                    <i className="fas fa-key me-2"></i>
                    Update Password
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SecurityScreen; 