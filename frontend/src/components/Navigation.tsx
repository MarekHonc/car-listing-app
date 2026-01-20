import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🚗 Car Listing
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Inzeráty
            </Nav.Link>
            <Nav.Link as={Link} to="/listings/new">
              Přidat inzerát
            </Nav.Link>
            <Nav.Link as={Link} to="/cars">
              Správa značek/modelů
            </Nav.Link>
            <Nav.Link as={Link} to="/tags">
              Správa štítků
            </Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              Přihlášen jako: <strong>{user?.name}</strong>
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Odhlásit se
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
