import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Modal, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createListing,
  updateListing,
  getListingById,
  getCarBrands,
  getCarModels,
  createCarBrand,
  createCarModel,
  getLocations,
  createLocation,
  getTags,
  createTag,
  addTagToListing,
} from '../services/api';
import { CarBrand, CarModel, Location, Tag } from '../types';

const ListingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [carModelId, setCarModelId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [allCarModels, setAllCarModels] = useState<CarModel[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelEngine, setNewModelEngine] = useState('');
  const [newModelPower, setNewModelPower] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationZipCode, setNewLocationZipCode] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#007bff');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  useEffect(() => {
    if (selectedBrandId) {
      const filtered = allCarModels.filter(
        (model) => model.carBrandId === parseInt(selectedBrandId)
      );
      setCarModels(filtered);
    } else {
      setCarModels(allCarModels);
    }
  }, [selectedBrandId, allCarModels]);

  const loadData = async () => {
    try {
      const [brandsData, modelsData, locationsData, tagsData] = await Promise.all([
        getCarBrands(),
        getCarModels(),
        getLocations(),
        getTags(),
      ]);
      setCarBrands(brandsData);
      setAllCarModels(modelsData);
      setCarModels(modelsData);
      setLocations(locationsData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání dat');
    }
  };

  const loadListing = async () => {
    try {
      const listing = await getListingById(parseInt(id!));
      setName(listing.name);
      setPrice(listing.price.toString());
      setLink(listing.link);
      setImageLink(listing.imageLink);
      setCarModelId(listing.carModelId?.toString() || '');
      setLocationId(listing.locationId?.toString() || '');
      setIsDeleted(listing.isDeleted);
      if (listing.carModelId && listing.carModel) {
        setSelectedBrandId(listing.carModel.carBrandId.toString());
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání inzerátu');
    }
  };

  // Validace URL obrázku - zakomentováno kvůli CORS
  // const validateImageUrl = async (url: string): Promise<boolean> => {
  //   try {
  //     setValidatingImage(true);
  //     const response = await axios.head(url, { timeout: 5000 });
  //     return response.status === 200;
  //   } catch (error) {
  //     return false;
  //   } finally {
  //     setValidatingImage(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !link || !imageLink || !locationId) {
      setError('Vyplňte všechna povinná pole (název, cena, link, obrázek, lokalita)');
      return;
    }

    if (parseFloat(price) <= 0) {
      setError('Cena musí být kladné číslo');
      return;
    }

    // Validace URL obrázku - zakomentováno kvůli CORS
    // const isImageValid = await validateImageUrl(imageLink);
    // if (!isImageValid) {
    //   setError('Odkaz na obrázek je neplatný nebo obrázek není dostupný (404)');
    //   return;
    // }

    setLoading(true);

    try {
      const data = {
        name,
        price: parseFloat(price),
        link,
        imageLink,
        carModelId: carModelId ? parseInt(carModelId) : undefined,
        locationId: parseInt(locationId),
        isDeleted,
      };

      let createdListingId: number;

      if (isEdit) {
        await updateListing(parseInt(id!), data);
        createdListingId = parseInt(id!);
      } else {
        const created = await createListing(data);
        createdListingId = created.id;
      }

      // Přidání štítků k novému inzerátu
      if (!isEdit && selectedTagIds.length > 0) {
        for (const tagId of selectedTagIds) {
          await addTagToListing({ tagId, listingId: createdListingId });
        }
      }

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při ukládání inzerátu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName) {
      setError('Zadejte název značky');
      return;
    }

    try {
      const brand = await createCarBrand({ name: newBrandName });
      setCarBrands([...carBrands, brand]);
      setSelectedBrandId(brand.id.toString());
      setNewBrandName('');
      setShowBrandModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při vytváření značky');
    }
  };

  const handleCreateModel = async () => {
    if (!newModelName || !selectedBrandId || !newModelEngine || !newModelPower) {
      setError('Vyplňte všechna pole pro model');
      return;
    }

    if (parseInt(newModelPower) <= 0) {
      setError('Výkon musí být kladné číslo');
      return;
    }

    try {
      const model = await createCarModel({
        name: newModelName,
        carBrandId: parseInt(selectedBrandId),
        engine: newModelEngine,
        power: parseInt(newModelPower),
      });
      setAllCarModels([...allCarModels, model]);
      setCarModels([...carModels, model]);
      setCarModelId(model.id.toString());
      setNewModelName('');
      setNewModelEngine('');
      setNewModelPower('');
      setShowModelModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při vytváření modelu');
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocationName || !newLocationZipCode) {
      setError('Vyplňte všechna pole pro lokalitu');
      return;
    }

    try {
      const location = await createLocation({ name: newLocationName, zipCode: newLocationZipCode });
      setLocations([...locations, location]);
      setLocationId(location.id.toString());
      setNewLocationName('');
      setNewLocationZipCode('');
      setShowLocationModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při vytváření lokality');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName) {
      setError('Vyplňte název štítku');
      return;
    }

    try {
      const tag = await createTag({ name: newTagName, color: newTagColor });
      setTags([...tags, tag]);
      setSelectedTagIds([...selectedTagIds, tag.id]);
      setNewTagName('');
      setNewTagColor('#007bff');
      setShowTagModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při vytváření štítku');
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h2>{isEdit ? 'Upravit inzerát' : 'Přidat inzerát'}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Název *</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cena (Kč) *</Form.Label>
              <Form.Control
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link *</Form.Label>
              <Form.Control
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Odkaz na obrázek *</Form.Label>
              <Form.Control
                type="url"
                value={imageLink}
                onChange={(e) => setImageLink(e.target.value)}
                required
              />
            </Form.Group>

            <Row>
              <Col md={10}>
                <Form.Group className="mb-3">
                  <Form.Label>Lokalita *</Form.Label>
                  <Form.Select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    required
                  >
                    <option value="">Vyberte lokalitu</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.zipCode})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-primary"
                  className="mb-3"
                  onClick={() => setShowLocationModal(true)}
                >
                  Nová lokalita
                </Button>
              </Col>
            </Row>

            <Row>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Značka</Form.Label>
                  <Form.Select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                  >
                    <option value="">Vyberte značku</option>
                    {carBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-primary"
                  className="mb-3"
                  onClick={() => setShowBrandModal(true)}
                >
                  Nová značka
                </Button>
              </Col>

              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Select
                    value={carModelId}
                    onChange={(e) => setCarModelId(e.target.value)}
                    disabled={!selectedBrandId}
                  >
                    <option value="">Vyberte model</option>
                    {carModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.engine} ({model.power} kW)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="outline-primary"
              className="mb-3"
              onClick={() => setShowModelModal(true)}
              disabled={!selectedBrandId}
            >
              Nový model
            </Button>

            {!isEdit && (
              <Form.Group className="mb-3">
                <Form.Label>Štítky</Form.Label>
                <div className="mb-2">
                  {tags.map((tag) => (
                    <Badge
                      className="custom-badge"
                      key={tag.id}
                      style={{ 
                        ["--tag-color" as any]: tag.color,
                        cursor: 'pointer',
                        marginRight: '5px',
                        marginBottom: '5px'
                      } as React.CSSProperties} 
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name} {selectedTagIds.includes(tag.id) && '✓'}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowTagModal(true)}
                >
                  + Vytvořit nový štítek
                </Button>
              </Form.Group>
            )}

            {isEdit && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Označit jako smazané"
                  checked={isDeleted}
                  onChange={(e) => setIsDeleted(e.target.checked)}
                />
              </Form.Group>
            )}

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Ukládání...' : isEdit ? 'Uložit' : 'Přidat'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                Zrušit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Brand Modal */}
      <Modal show={showBrandModal} onHide={() => setShowBrandModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nová značka</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Název značky</Form.Label>
            <Form.Control
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBrandModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleCreateBrand}>
            Vytvořit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Model Modal */}
      <Modal show={showModelModal} onHide={() => setShowModelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nový model</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Název modelu</Form.Label>
            <Form.Control
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Motor</Form.Label>
            <Form.Control
              type="text"
              value={newModelEngine}
              onChange={(e) => setNewModelEngine(e.target.value)}
              placeholder="např. 2.0 TSI"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Výkon (kW)</Form.Label>
            <Form.Control
              type="number"
              value={newModelPower}
              onChange={(e) => setNewModelPower(e.target.value)}
              min="1"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModelModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleCreateModel}>
            Vytvořit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Location Modal */}
      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nová lokalita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Název lokality</Form.Label>
            <Form.Control
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="např. Praha 1"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>PSČ</Form.Label>
            <Form.Control
              type="text"
              value={newLocationZipCode}
              onChange={(e) => setNewLocationZipCode(e.target.value)}
              placeholder="např. 110 00"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLocationModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleCreateLocation}>
            Vytvořit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tag Modal */}
      <Modal show={showTagModal} onHide={() => setShowTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nový štítek</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Název štítku</Form.Label>
            <Form.Control
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Barva štítku</Form.Label>
            <Form.Control
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>
            Zrušit
          </Button>
          <Button variant="primary" onClick={handleCreateTag}>
            Vytvořit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListingForm;
