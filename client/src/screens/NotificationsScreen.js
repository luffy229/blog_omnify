import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import Message from '../components/Message';

const NotificationsScreen = () => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useContext(NotificationContext);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch latest notifications
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <i className="fas fa-heart text-danger"></i>;
      case 'comment':
        return <i className="fas fa-comment text-primary"></i>;
      case 'reply':
        return <i className="fas fa-reply text-success"></i>;
      default:
        return <i className="fas fa-bell text-warning"></i>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    try {
      // Mark as read if not already
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
      
      // Navigate to the blog
      if (notification && notification.blog && notification.blog._id) {
        navigate(`/blog/${notification.blog._id}`);
      } else {
        console.error('Invalid notification object:', notification);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <div className="notifications-page">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Notifications</h1>
        </Col>
        <Col xs="auto">
          {notifications && notifications.length > 0 && (
            <Button 
              variant="outline-primary" 
              onClick={markAllAsRead}
              className="me-2"
            >
              Mark All as Read
            </Button>
          )}
          <Link to="/" className="btn btn-light">
            <i className="fas fa-arrow-left me-1"></i> Back
          </Link>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !notifications || notifications.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <div className="mb-4">
              <i className="far fa-bell-slash fa-4x text-muted"></i>
            </div>
            <h4>No notifications yet</h4>
            <p className="text-muted">
              When someone interacts with your blogs, you'll see notifications here.
            </p>
            <Link to="/" className="btn btn-primary">
              Browse Blogs
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item 
                key={notification._id} 
                action
                onClick={() => handleNotificationClick(notification)}
                className={`py-3 px-4 ${!notification.isRead ? 'unread-notification' : ''}`}
              >
                <Row className="align-items-center">
                  <Col xs={1} className="text-center">
                    {getNotificationIcon(notification.type)}
                  </Col>
                  <Col>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="mb-1">
                          {notification.text}
                          {!notification.isRead && (
                            <Badge bg="primary" pill className="ms-2">
                              New
                            </Badge>
                          )}
                        </p>
                        <small className="text-muted">
                          {formatDate(notification.createdAt)}
                        </small>
                      </div>
                      <Button
                        variant="light"
                        size="sm"
                        className="text-danger notification-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </div>
  );
};

export default NotificationsScreen; 