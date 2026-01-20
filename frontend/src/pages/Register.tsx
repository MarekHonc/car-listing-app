import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !password || !confirmPassword) {
      setError('Vyplňte všechna pole');
      return;
    }

    if (name.length < 3) {
      setError('Jméno musí mít alespoň 3 znaky');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRegister({ name, password });
      login(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při registraci');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Registrace</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Uživatelské jméno</Form.Label>
              <Form.Control
                type="text"
                placeholder="Zadejte jméno (min. 3 znaky)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Heslo</Form.Label>
              <Form.Control
                type="password"
                placeholder="Zadejte heslo (min. 6 znaků)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Potvrzení hesla</Form.Label>
              <Form.Control
                type="password"
                placeholder="Zadejte heslo znovu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Registrování...' : 'Zaregistrovat se'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Link to="/login">Máte již účet? Přihlaste se</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
