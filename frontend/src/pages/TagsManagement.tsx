import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Modal, Form } from 'react-bootstrap';
import {
  getTags,
  createTag,
} from '../services/api';
import { Tag } from '../types';

const TagsManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#007bff');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tagsData = await getTags();
      setTags(tagsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání dat');
    }
  };

  const handleOpenModal = () => {
    setTagName('');
    setTagColor('#007bff');
    setShowModal(true);
  };

  const handleSaveTag = async () => {
    if (!tagName.trim()) {
      setError('Vyplňte název štítku');
      return;
    }

    try {
      await createTag({ name: tagName, color: tagColor });
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při vytváření štítku');
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Správa štítků</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Štítky</h4>
              <Button variant="primary" onClick={handleOpenModal}>
                Přidat štítek
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Název</th>
                    <th>Barva</th>
                    <th>Náhled</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td>{tag.id}</td>
                      <td>{tag.name}</td>
                      <td>{tag.color}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nový štítek</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Název štítku</Form.Label>
            <Form.Control
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Název štítku"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Barva štítku</Form.Label>
            <Form.Control
              type="color"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleSaveTag}>
            Vytvořit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TagsManagement;
