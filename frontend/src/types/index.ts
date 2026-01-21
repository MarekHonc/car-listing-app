export interface User {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
  zipCode: string;
}

export interface CarBrand {
  id: number;
  name: string;
  carModels?: CarModel[];
}

export interface CarModel {
  id: number;
  name: string;
  carBrandId: number;
  engine: string;
  power: number;
  carBrand?: CarBrand;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TagToListing {
  tagId: number;
  listingId: number;
  userId: number;
  tag: Tag;
}

export interface Comment {
  id: number;
  text: string;
  date: string;
  listingId: number;
  addedByUserId: number;
  addedByUser: User;
}

export interface Listing {
  id: number;
  name: string;
  price: number;
  link: string;
  imageLink: string;
  addedByUserId: number;
  isDeleted: boolean;
  carModelId?: number;
  locationId?: number;
  createdAt: string;
  modifiedAt: string;
  addedByUser: User;
  carModel?: CarModel;
  location?: Location;
  comments?: Comment[];
  tagToListings?: TagToListing[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  name: string;
  password: string;
}

export interface RegisterData {
  name: string;
  password: string;
}
