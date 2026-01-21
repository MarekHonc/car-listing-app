import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, ListGroup, Badge, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getListingById,
  deleteListing,
  createComment,
  updateComment,
  deleteComment,
  getTags,
  createTag,
  addTagToListing,
  removeTagFromListing,
} from '../services/api';
import { Listing, Comment, Tag } from '../types';
import { useAuth } from '../utils/AuthContext';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [showCreateTagForm, setShowCreateTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#007bff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [listingData, tagsData] = await Promise.all([
        getListingById(parseInt(id!)),
        getTags(),
      ]);
      setListing(listingData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await createComment({ text: commentText, listingId: parseInt(id!) });
      setCommentText('');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při přidávání komentáře');
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingCommentText.trim()) return;

    try {
      await updateComment(commentId, { text: editingCommentText });
      setEditingCommentId(null);
      setEditingCommentText('');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při aktualizaci komentáře');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Opravdu chcete smazat tento komentář?')) return;

    try {
      await deleteComment(commentId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při mazání komentáře');
    }
  };

  const handleDeleteListing = async () => {
    try {
      await deleteListing(parseInt(id!));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při mazání inzerátu');
    }
  };

  const handleAddTag = async () => {
    if (!selectedTagId) return;

    try {
      await addTagToListing({
        tagId: parseInt(selectedTagId),
        listingId: parseInt(id!),
      });
      setShowTagModal(false);
      setSelectedTagId('');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při přidávání štítku');
    }
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) {
      setError('Vyplňte název štítku');
      return;
    }

    try {
      const newTag = await createTag({ name: newTagName, color: newTagColor });
      await loadData();
      setSelectedTagId(newTag.id.toString());
      setNewTagName('');
      setNewTagColor('#007bff');
      setShowCreateTagForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při vytváření štítku');
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await removeTagFromListing(tagId, parseInt(id!));
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chyba při odebírání štítku');
    }
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  if (loading) {
    return <Container className="mt-4">Načítání...</Container>;
  }

  if (!listing) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Inzerát nenalezen</Alert>
      </Container>
    );
  }

  const userTags = listing.tagToListings?.filter((ttl) => ttl.userId === user?.id) || [];
  const allTags = listing.tagToListings || [];
  const availableTags = tags.filter(
    (tag) => !userTags.some((ttl) => ttl.tagId === tag.id)
  );

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className={listing.isDeleted ? 'text-decoration-line-through opacity-50' : ''}>
        <Card.Img
          variant="top"
          src={listing.imageLink}
          alt={listing.name}
          style={{ maxHeight: '400px', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image';
          }}
        />
        <Card.Body>
          <Card.Title>{listing.name}</Card.Title>
          <Card.Text>
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
            <strong>Přidal:</strong> {listing.addedByUser.name}<br />
            <strong>Vytvořeno:</strong> {new Date(listing.createdAt).toLocaleString()}<br />
            <strong>Link:</strong>{' '}
            <a href={listing.link} target="_blank" rel="noopener noreferrer">
              Zobrazit inzerát
            </a>
          </Card.Text>

          <div className="mb-3">
            <strong>Štítky: </strong>
            {allTags.map((ttl) => (
              <Badge
                key={`${ttl.tag.id}-${ttl.userId}`}
                style={{ ["--tag-color" as any]: ttl.tag.color } as React.CSSProperties}
                className="me-1 custom-badge"
              >
                {ttl.tag.name}
                {ttl.userId === user?.id && (
                  <span
                    className="ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveTag(ttl.tagId)}
                  >
                    ×
                  </span>
                )}
              </Badge>
            ))}
            <Button
              variant="outline-primary"
              size="sm"
              className="ms-2"
              onClick={() => setShowTagModal(true)}
            >
              Přidat štítek
            </Button>
          </div>

          <div className="d-flex gap-2">
            <Link to={`/listings/edit/${listing.id}`}>
              <Button variant="warning">Upravit</Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Smazat
            </Button>
            <Link to="/">
              <Button variant="secondary">Zpět</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h4>Komentáře ({listing.comments?.length || 0})</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddComment} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Nový komentář</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Napište komentář..."
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Přidat komentář
            </Button>
          </Form>

          <ListGroup>
            {listing.comments && listing.comments.length > 0 ? (
              listing.comments.map((comment) => (
                <ListGroup.Item key={comment.id}>
                  {editingCommentId === comment.id ? (
                    <>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                      />
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateComment(comment.id)}
                          className="me-2"
                        >
                          Uložit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingCommentText('');
                          }}
                        >
                          Zrušit
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{comment.text}</p>
                      <small className="text-muted">
                        {comment.addedByUser.name} -{' '}
                        {new Date(comment.date).toLocaleString()}
                      </small>
                      {user?.id === comment.addedByUserId && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => startEditComment(comment)}
                            className="me-2"
                          >
                            Upravit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Smazat
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>Zatím žádné komentáře</ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Smazat inzerát</Modal.Title>
        </Modal.Header>
        <Modal.Body>Opravdu chcete smazat tento inzerát?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Zrušit
          </Button>
          <Button variant="danger" onClick={handleDeleteListing}>
            Smazat
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTagModal} onHide={() => {
        setShowTagModal(false);
        setShowCreateTagForm(false);
        setNewTagName('');
        setNewTagColor('#007bff');
        setError('');
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Přidat štítek</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showCreateTagForm ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Vyberte štítek</Form.Label>
                <Form.Select
                  value={selectedTagId}
                  onChange={(e) => setSelectedTagId(e.target.value)}
                >
                  <option value="">Vyberte štítek</option>
                  {availableTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowCreateTagForm(true)}
              >
                + Vytvořit nový štítek
              </Button>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Název štítku</Form.Label>
                <Form.Control
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Název štítku"
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setShowCreateTagForm(false);
                  setNewTagName('');
                  setNewTagColor('#007bff');
                }}
              >
                ← Zpět na výběr
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowTagModal(false);
            setShowCreateTagForm(false);
            setNewTagName('');
            setNewTagColor('#007bff');
            setError('');
          }}>
            Zrušit
          </Button>
          {!showCreateTagForm ? (
            <Button variant="primary" onClick={handleAddTag} disabled={!selectedTagId}>
              Přidat
            </Button>
          ) : (
            <Button variant="primary" onClick={handleCreateNewTag}>
              Vytvořit a použít
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListingDetail;
