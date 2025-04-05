import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const logoutHandler = () => {
    logout();
  };

  return (
    <header>
      <Navbar 
        bg={scrolled ? "white" : "white"} 
        variant={scrolled ? "light" : "light"} 
        expand="lg" 
        fixed="top" 
        collapseOnSelect
        className={scrolled ? "py-2 shadow-sm" : "py-3"}
        style={{ transition: 'all 0.3s ease' }}
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <i className="fas fa-pen-fancy me-2"></i>
              Blog App
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <LinkContainer to="/">
                <Nav.Link>
                  <i className="fas fa-home me-1"></i> Home
                </Nav.Link>
              </LinkContainer>
              
              {user && (
                <>
                  <LinkContainer to="/create-blog">
                    <Nav.Link>
                      <i className="fas fa-plus-circle me-1"></i> Create Blog
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/notifications">
                    <Nav.Link className="position-relative me-3">
                      <i className="fas fa-bell me-1"></i>
                      <span className="d-inline d-lg-none">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge 
                          pill 
                          bg="danger" 
                          className="notification-badge position-absolute top-0 start-100 translate-middle"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
              
              {user ? (
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      {user.avatar ? (
                        <Image 
                          src={user.avatar} 
                          width="25" 
                          height="25" 
                          roundedCircle 
                          className="me-1"
                          style={{ objectFit: 'cover' }}
                          key={user.avatar}
                        />
                      ) : (
                        <i className="fas fa-user-circle me-1"></i>
                      )}
                      {user.name}
                    </span>
                  } 
                  id="username"
                >
                  <LinkContainer to={`/user/${user._id}`}>
                    <NavDropdown.Item>
                      <i className="fas fa-user me-2"></i> My Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Header>Settings</NavDropdown.Header>
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>
                      <i className="fas fa-user-edit me-2"></i> Edit Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/security">
                    <NavDropdown.Item>
                      <i className="fas fa-shield-alt me-2"></i> Security
                    </NavDropdown.Item>
                  </LinkContainer>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Header>Content</NavDropdown.Header>
                  <LinkContainer to="/my-blogs">
                    <NavDropdown.Item>
                      <i className="fas fa-list me-2"></i> My Blogs
                    </NavDropdown.Item>
                  </LinkContainer>
                  
                  <NavDropdown.Divider />
                  
                  
                  
                  
                  
                  <NavDropdown.Item onClick={logoutHandler}>
                    <i className="fas fa-sign-out-alt me-2"></i> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>
                      <i className="fas fa-sign-in-alt me-1"></i> Sign In
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link className="btn btn-primary text-white ms-2 px-3">
                      <i className="fas fa-user-plus me-1"></i> Sign Up
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div style={{ paddingTop: '70px' }}></div>
    </header>
  );
};

export default Header; 