import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user, register } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    const result = await register(name, email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <Container fluid="md" className="py-4 py-md-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-form shadow-lg border-0 fade-in">
            <Card.Body className="p-3 p-sm-4 p-md-5">
              <div className="text-center mb-4">
                <i className="fas fa-user-plus text-primary" style={{ fontSize: '2.5rem' }}></i>
                <h2 className="mt-3 fs-3 fs-md-2">Create Account</h2>
                <p className="text-muted small">Join our community of bloggers</p>
              </div>
              
              {error && <Message variant="danger">{error}</Message>}
              {loading && <Loader />}
              
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label className="small text-muted fw-bold">
                    <i className="fas fa-user me-2"></i>Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="py-2 rounded-3"
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label className="small text-muted fw-bold">
                    <i className="fas fa-envelope me-2"></i>Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-2 rounded-3"
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label className="small text-muted fw-bold">
                    <i className="fas fa-lock me-2"></i>Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2 rounded-3"
                    />
                    <Button 
                      variant="link" 
                      className="position-absolute end-0 top-0 text-decoration-none" 
                      style={{ padding: '8px 12px' }}
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </div>
                  <Form.Text className="text-muted small">
                    Password must be at least 6 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-4">
                  <Form.Label className="small text-muted fw-bold">
                    <i className="fas fa-check-double me-2"></i>Confirm Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="py-2 rounded-3"
                    />
                    <Button 
                      variant="link" 
                      className="position-absolute end-0 top-0 text-decoration-none" 
                      style={{ padding: '8px 12px' }}
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3 rounded-3" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>Sign Up</>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0 small">
                  Already have an account? <Link to="/login" className="text-primary fw-bold">Sign In</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4 d-sm-none">
            <Link to="/" className="btn btn-outline-secondary btn-sm">
              <i className="fas fa-home me-2"></i>Back to Home
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterScreen; 