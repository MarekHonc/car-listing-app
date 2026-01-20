import axios from 'axios';
import {
  AuthResponse,
  LoginData,
  RegisterData,
  Listing,
  CarBrand,
  CarModel,
  Comment,
  Tag,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data: RegisterData): Promise<AuthResponse> =>
  api.post('/auth/register', data).then((res) => res.data);

export const login = (data: LoginData): Promise<AuthResponse> =>
  api.post('/auth/login', data).then((res) => res.data);

// Car Brands
export const getCarBrands = (): Promise<CarBrand[]> =>
  api.get('/carbrands').then((res) => res.data);

export const getCarBrandById = (id: number): Promise<CarBrand> =>
  api.get(`/carbrands/${id}`).then((res) => res.data);

export const createCarBrand = (data: { name: string }): Promise<CarBrand> =>
  api.post('/carbrands', data).then((res) => res.data);

export const updateCarBrand = (id: number, data: { name: string }): Promise<CarBrand> =>
  api.put(`/carbrands/${id}`, data).then((res) => res.data);

export const deleteCarBrand = (id: number): Promise<void> =>
  api.delete(`/carbrands/${id}`).then((res) => res.data);

// Car Models
export const getCarModels = (carBrandId?: number): Promise<CarModel[]> =>
  api.get('/carmodels', { params: { carBrandId } }).then((res) => res.data);

export const getCarModelById = (id: number): Promise<CarModel> =>
  api.get(`/carmodels/${id}`).then((res) => res.data);

export const createCarModel = (data: Partial<CarModel>): Promise<CarModel> =>
  api.post('/carmodels', data).then((res) => res.data);

export const updateCarModel = (id: number, data: Partial<CarModel>): Promise<CarModel> =>
  api.put(`/carmodels/${id}`, data).then((res) => res.data);

export const deleteCarModel = (id: number): Promise<void> =>
  api.delete(`/carmodels/${id}`).then((res) => res.data);

// Listings
export const getListings = (params?: {
  carBrandId?: number;
  carModelId?: number;
  tagIds?: string;
}): Promise<Listing[]> =>
  api.get('/listings', { params }).then((res) => res.data);

export const getListingById = (id: number): Promise<Listing> =>
  api.get(`/listings/${id}`).then((res) => res.data);

export const createListing = (data: Partial<Listing>): Promise<Listing> =>
  api.post('/listings', data).then((res) => res.data);

export const updateListing = (id: number, data: Partial<Listing>): Promise<Listing> =>
  api.put(`/listings/${id}`, data).then((res) => res.data);

export const deleteListing = (id: number): Promise<void> =>
  api.delete(`/listings/${id}`).then((res) => res.data);

// Comments
export const createComment = (data: { text: string; listingId: number }): Promise<Comment> =>
  api.post('/comments', data).then((res) => res.data);

export const updateComment = (id: number, data: { text: string }): Promise<Comment> =>
  api.put(`/comments/${id}`, data).then((res) => res.data);

export const deleteComment = (id: number): Promise<void> =>
  api.delete(`/comments/${id}`).then((res) => res.data);

// Tags
export const getTags = (): Promise<Tag[]> =>
  api.get('/tags').then((res) => res.data);

export const createTag = (data: { name: string; color: string }): Promise<Tag> =>
  api.post('/tags', data).then((res) => res.data);

export const addTagToListing = (data: { tagId: number; listingId: number }): Promise<void> =>
  api.post('/tags/listing', data).then((res) => res.data);

export const removeTagFromListing = (tagId: number, listingId: number): Promise<void> =>
  api.delete(`/tags/${tagId}/listing/${listingId}`).then((res) => res.data);

export default api;
