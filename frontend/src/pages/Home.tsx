import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getListings, getCarBrands, getCarModels, getTags } from '../services/api';
import { Listing, CarBrand, CarModel, Tag } from '../types';

const Home: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [allCarModels, setAllCarModels] = useState<CarModel[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      const filtered = allCarModels.filter(
        (model) => model.carBrandId === parseInt(selectedBrand)
      );
      setCarModels(filtered);
      setSelectedModel('');
    } else {
      setCarModels(allCarModels);
      setSelectedModel('');
    }
  }, [selectedBrand, allCarModels]);

  useEffect(() => {
    loadListings();
  }, [selectedBrand, selectedModel, selectedTags]);

  const loadData = async () => {
    try {
      const [brandsData, modelsData, tagsData] = await Promise.all([
        getCarBrands(),
        getCarModels(),
        getTags(),
      ]);
      setCarBrands(brandsData);
      setAllCarModels(modelsData);
      setCarModels(modelsData);
      setTags(tagsData);
      await loadListings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      const params: any = {};
      if (selectedBrand) params.carBrandId = parseInt(selectedBrand);
      if (selectedModel) params.carModelId = parseInt(selectedModel);
      if (selectedTags.length > 0) params.tagIds = selectedTags.join(',');

      const data = await getListings(params);
      setListings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání inzerátů');
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Načítání...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Inzeráty automobilů</h1>
        </Col>
        <Col className="text-end">
          <Link to="/listings/new">
            <Button variant="primary">Přidat inzerát</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Značka</Form.Label>
            <Form.Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Všechny značky</option>
              {carBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Model</Form.Label>
            <Form.Select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand}
            >
              <option value="">Všechny modely</option>
              {carModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Štítky</Form.Label>
            <div>
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className="me-2 mb-2 custom-badge"
                  style={{ 
                    cursor: 'pointer', 
                    ["--tag-color" as any]: `${selectedTags.includes(tag.id) ? tag.color : '#6c757d'}`,
                  } as React.CSSProperties}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </Form.Group>
        </Col>

        <Col md={2} className="d-flex align-items-end">
          <Button variant="outline-secondary" className="mb-3" onClick={clearFilters}>
            Vymazat filtry
          </Button>
        </Col>
      </Row>

      <Row>
        {listings.length === 0 ? (
          <Col>
            <Alert variant="info">Žádné inzeráty nenalezeny.</Alert>
          </Col>
        ) : (
          listings.map((listing) => (
            <Col key={listing.id} md={6} lg={4} className="mb-4">
              <Card className={listing.isDeleted ? 'text-decoration-line-through opacity-50' : ''}>
                <Card.Img
                  variant="top"
                  src={listing.imageLink}
                  alt={listing.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                  }}
                />
                <Card.Body>
                  <Card.Title>{listing.name}</Card.Title>
                  <Card.Text>
                    <a href={listing.link} target="_blank">Inzerát</a><br />
                    <strong>Cena:</strong> {listing.price.toLocaleString()} Kč<br />
                    {listing.location && (
                      <>
                        <strong>Lokalita:</strong> {listing.location.name} ({listing.location.zipCode})<br />
                      </>
                    )}
                    {listing.carModel && (
                      <>
                        <strong>Značka:</strong> {listing.carModel.carBrand?.name}<br />
                        <strong>Model:</strong> {listing.carModel.name}<br />
                        <strong>Motor:</strong> {listing.carModel.engine}<br />
                        <strong>Výkon:</strong> {listing.carModel.power} kW<br />
                      </>
                    )}
                    {listing.comments && listing.comments.length > 0 && (
                      <>
                        <strong>Poslední komentář:</strong> {listing.comments[0].text.substring(0, 50)}...
                        <br />
                        <small className="text-muted">
                          {listing.comments[0].addedByUser.name} - {new Date(listing.comments[0].date).toLocaleDateString()}
                        </small>
                      </>
                    )}
                  </Card.Text>
                  <div className="mb-2">
                    {listing.tagToListings?.map((ttl) => (
                      <Badge 
                        key={ttl.tag.id} 
                        style={{ ["--tag-color" as any]: ttl.tag.color } as React.CSSProperties}
                        className="me-1 custom-badge"
                      >
                        {ttl.tag.name}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/listings/${listing.id}`}>
                    <Button variant="primary" size="sm">
                      Detail
                    </Button>
                  </Link>
                  {listing.isDeleted && (
                    <Badge bg="danger" className="ms-2">
                      Smazáno
                    </Badge>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Home;
