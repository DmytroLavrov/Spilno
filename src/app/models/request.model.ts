export type RequestType = 'plumbing' | 'electrical' | 'other';
export type RequestStatus = 'new' | 'in_progress' | 'done' | 'rejected';

export interface MaintenanceRequest {
  id: string;
  userId: string;
  userName: string;
  apartmentNumber: string;
  type: RequestType;
  status: RequestStatus;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
