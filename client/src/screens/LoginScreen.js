import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, login } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container fluid="md" className="py-4 py-md-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-form shadow-lg border-0 fade-in">
            <Card.Body className="p-3 p-sm-4 p-md-5">
              <div className="text-center mb-4">
                <i className="fas fa-user-circle text-primary" style={{ fontSize: '2.5rem' }}></i>
                <h2 className="mt-3 fs-3 fs-md-2">Welcome Back</h2>
                <p className="text-muted small">Sign in to continue to Blog App</p>
              </div>
              
              {error && <Message variant="danger">{error}</Message>}
              {loading && <Loader />}
              
              <Form onSubmit={submitHandler}>
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2 rounded-3"
                    />
                    <Button 
                      variant="link" 
                      className="position-absolute end-0 top-0 text-decoration-none" 
                      style={{ padding: '8px 12px' }}
                      onClick={togglePasswordVisibility}
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </div>
                </Form.Group>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    className="small"
                  />
                  <Link to="#" className="text-primary small">
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3 rounded-3" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    <>Sign In</>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0 small">
                  Don't have an account? <Link to="/register" className="text-primary fw-bold">Sign Up</Link>
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

export default LoginScreen; 