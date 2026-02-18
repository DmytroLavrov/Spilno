export type UserRole = 'admin' | 'resident';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartmentNumber: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}
