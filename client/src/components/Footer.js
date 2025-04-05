import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <Container>
        <Row className="py-3">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Blog App</h5>
            <p className="mb-3">Share your thoughts and stories with the world. Create engaging content that resonates with readers.</p>
            <div className="d-flex">
              <a href="https://www.linkedin.com/in/pratik-22917-pal?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="me-3 social-icon">
                <i className="fab fa-linkedin-in fa-lg"></i>
              </a>
              <a href="https://github.com/luffy229" target="_blank" rel="noopener noreferrer" className="me-3 social-icon">
                <i className="fab fa-github fa-lg"></i>
              </a>
              <a href="https://portfolio-iota-navy-35.vercel.app/" target="_blank" rel="noopener noreferrer" className="me-3 social-icon">
                <i className="fab fa-pinterest fa-lg"></i>
              </a>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="footer-link">
                  <i className="fas fa-angle-right me-2"></i>Home
                </a>
              </li>
              <li className="mb-2">
                <a href="/login" className="footer-link">
                  <i className="fas fa-angle-right me-2"></i>Login
                </a>
              </li>
              <li className="mb-2">
                <a href="/register" className="footer-link">
                  <i className="fas fa-angle-right me-2"></i>Register
                </a>
              </li>
              
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="text-uppercase mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                Goa, India
              </li>
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                pratik2002pal@gmail.com
              </li>
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i>
                +91 9064671540
              </li>
            </ul>
          </Col>
        </Row>
        
        <Row className="mt-3 pt-3 border-top">
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Blog App || Pratik Pal || All rights reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 