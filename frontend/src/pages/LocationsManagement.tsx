import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Modal, Form } from 'react-bootstrap';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../services/api';
import { Location } from '../types';

const LocationsManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationZipCode, setLocationZipCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const locationsData = await getLocations();
      setLocations(locationsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání dat');
    }
  };

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setLocationName(location.name);
      setLocationZipCode(location.zipCode);
    } else {
      setEditingLocation(null);
      setLocationName('');
      setLocationZipCode('');
    }
    setShowModal(true);
  };

  const handleSaveLocation = async () => {
    if (!locationName.trim() || !locationZipCode.trim()) {
      setError('Vyplňte všechna pole');
      return;
    }

    try {
      const data = { name: locationName, zipCode: locationZipCode };
      if (editingLocation) {
        await updateLocation(editingLocation.id, data);
      } else {
        await createLocation(data);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při ukládání lokality');
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!window.confirm('Opravdu chcete smazat tuto lokalitu?')) {
      return;
    }

    try {
      await deleteLocation(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při mazání lokality');
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Správa lokalit</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Lokality</h4>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Přidat lokalitu
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Název</th>
                    <th>PSČ</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.id}>
                      <td>{location.id}</td>
                      <td>{location.name}</td>
                      <td>{location.zipCode}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => handleOpenModal(location)}
                        >
                          Upravit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteLocation(location.id)}
                        >
                          Smazat
                        </Button>
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
          <Modal.Title>{editingLocation ? 'Upravit lokalitu' : 'Nová lokalita'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Název lokality</Form.Label>
            <Form.Control
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="např. Praha 1"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>PSČ</Form.Label>
            <Form.Control
              type="text"
              value={locationZipCode}
              onChange={(e) => setLocationZipCode(e.target.value)}
              placeholder="např. 110 00"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleSaveLocation}>
            Uložit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LocationsManagement;
