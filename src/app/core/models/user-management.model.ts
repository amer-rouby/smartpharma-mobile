export type StaffRole = 'ADMIN' | 'PHARMACIST' | 'MANAGER' | 'VIEWER';

export interface StaffUser {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  isActive: boolean;
  pharmacyId: number;
  pharmacyName?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUserRequest {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  pharmacyId: number;
  isActive?: boolean;
}
