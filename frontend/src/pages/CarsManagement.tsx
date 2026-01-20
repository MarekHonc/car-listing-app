import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Modal, Form } from 'react-bootstrap';
import {
  getCarBrands,
  getCarModels,
  createCarBrand,
  updateCarBrand,
  deleteCarBrand,
  createCarModel,
  updateCarModel,
  deleteCarModel,
} from '../services/api';
import { CarBrand, CarModel } from '../types';

const CarsManagement: React.FC = () => {
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [error, setError] = useState('');

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<CarBrand | null>(null);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);

  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelBrandId, setModelBrandId] = useState<string>('');
  const [modelEngine, setModelEngine] = useState('');
  const [modelPower, setModelPower] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [brandsData, modelsData] = await Promise.all([
        getCarBrands(),
        getCarModels(),
      ]);
      setCarBrands(brandsData);
      setCarModels(modelsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání dat');
    }
  };

  const handleOpenBrandModal = (brand?: CarBrand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.name);
    } else {
      setEditingBrand(null);
      setBrandName('');
    }
    setShowBrandModal(true);
  };

  const handleOpenModelModal = (model?: CarModel) => {
    if (model) {
      setEditingModel(model);
      setModelName(model.name);
      setModelBrandId(model.carBrandId.toString());
      setModelEngine(model.engine);
      setModelPower(model.power.toString());
    } else {
      setEditingModel(null);
      setModelName('');
      setModelBrandId('');
      setModelEngine('');
      setModelPower('');
    }
    setShowModelModal(true);
  };

  const handleSaveBrand = async () => {
    if (!brandName.trim()) {
      setError('Vyplňte název značky');
      return;
    }

    try {
      if (editingBrand) {
        await updateCarBrand(editingBrand.id, { name: brandName });
      } else {
        await createCarBrand({ name: brandName });
      }
      setShowBrandModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při ukládání značky');
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm('Opravdu chcete smazat tuto značku? Budou smazány i všechny její modely.')) {
      return;
    }

    try {
      await deleteCarBrand(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při mazání značky');
    }
  };

  const handleSaveModel = async () => {
    if (!modelName.trim() || !modelBrandId || !modelEngine.trim() || !modelPower) {
      setError('Vyplňte všechna pole');
      return;
    }

    if (parseInt(modelPower) <= 0) {
      setError('Výkon musí být kladné číslo');
      return;
    }

    try {
      const data = {
        name: modelName,
        carBrandId: parseInt(modelBrandId),
        engine: modelEngine,
        power: parseInt(modelPower),
      };

      if (editingModel) {
        await updateCarModel(editingModel.id, data);
      } else {
        await createCarModel(data);
      }
      setShowModelModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při ukládání modelu');
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Opravdu chcete smazat tento model?')) {
      return;
    }

    try {
      await deleteCarModel(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při mazání modelu');
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Správa značek a modelů</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Značky</h4>
              <Button variant="primary" onClick={() => handleOpenBrandModal()}>
                Přidat značku
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Název</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {carBrands.map((brand) => (
                    <tr key={brand.id}>
                      <td>{brand.id}</td>
                      <td>{brand.name}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => handleOpenBrandModal(brand)}
                        >
                          Upravit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteBrand(brand.id)}
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

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Modely</h4>
              <Button variant="primary" onClick={() => handleOpenModelModal()}>
                Přidat model
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Název</th>
                    <th>Značka</th>
                    <th>Motor</th>
                    <th>Výkon (kW)</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {carModels.map((model) => (
                    <tr key={model.id}>
                      <td>{model.id}</td>
                      <td>{model.name}</td>
                      <td>{model.carBrand?.name}</td>
                      <td>{model.engine}</td>
                      <td>{model.power}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => handleOpenModelModal(model)}
                        >
                          Upravit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteModel(model.id)}
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

      <Modal show={showBrandModal} onHide={() => setShowBrandModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingBrand ? 'Upravit značku' : 'Nová značka'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Název značky</Form.Label>
            <Form.Control
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBrandModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleSaveBrand}>
            Uložit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModelModal} onHide={() => setShowModelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingModel ? 'Upravit model' : 'Nový model'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Název modelu</Form.Label>
            <Form.Control
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Značka</Form.Label>
            <Form.Select
              value={modelBrandId}
              onChange={(e) => setModelBrandId(e.target.value)}
            >
              <option value="">Vyberte značku</option>
              {carBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Motor</Form.Label>
            <Form.Control
              type="text"
              value={modelEngine}
              onChange={(e) => setModelEngine(e.target.value)}
              placeholder="např. 2.0 TSI"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Výkon (kW)</Form.Label>
            <Form.Control
              type="number"
              value={modelPower}
              onChange={(e) => setModelPower(e.target.value)}
              min="1"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModelModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleSaveModel}>
            Uložit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CarsManagement;
