export interface Profile {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  jobTitle?: string;
  department?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  gender?: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
  jobTitle?: string;
  department?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  gender?: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileImageUploadResult {
  url: string;
  filename: string;
}
