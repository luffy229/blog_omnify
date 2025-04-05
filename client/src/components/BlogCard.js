import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Badge } from 'react-bootstrap';

const BlogCard = ({ blog }) => {
  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card className="blog-card h-100 border-0 shadow-sm hover-lift">
      <Card.Body className="p-4">
        <div className="blog-meta d-flex align-items-center mb-3">
          <div className="author-avatar me-2">
            <i className="fas fa-user-circle text-primary fa-lg"></i>
          </div>
          <small className="text-muted">
            {blog.author?.name || 'Anonymous'} • {formatDate(blog.createdAt)}
          </small>
        </div>

        <Link to={`/blog/${blog._id}`} className="text-decoration-none">
          <Card.Title as="h4" className="blog-title mb-3">
            {blog.title}
          </Card.Title>
        </Link>

        <Card.Text className="blog-excerpt text-secondary mb-3">
          {truncateText(blog.content, 150)}
        </Card.Text>

        <Row className="blog-stats align-items-center mt-auto">
          <Col>
            <div className="d-flex align-items-center text-muted">
              <span className="me-3">
                <i className="far fa-heart me-1"></i> {blog.likes ? blog.likes.length : 0}
              </span>
              <span className="me-3">
                <i className="far fa-comment me-1"></i> {blog.comments ? blog.comments.length : 0}
              </span>
              <span>
                <i className="far fa-eye me-1"></i> {blog.viewCount || 0}
              </span>
            </div>
          </Col>
          <Col xs="auto">
            <Badge bg="light" text="dark" className="px-3 py-2">
              <i className="far fa-clock me-1"></i> {blog.readTime || 1} min read
            </Badge>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BlogCard; 