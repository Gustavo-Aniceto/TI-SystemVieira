export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'intern' | 'supervisor';
  email: string;
  companyId?: string;
  department?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  departments: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  quantity: number;
  minQuantity: number;
  status: 'active' | 'inactive' | 'maintenance';
  serialNumber?: string;
  location?: string;
  department?: string;
  branch?: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  lifecycleStatus: 'new' | 'in-use' | 'maintenance' | 'disposed';
  notes?: string;
  createdAt: string;
  maintenanceHistory: MaintenanceRecord[];
  movementHistory: MovementRecord[];
  licenseExpiration?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost?: number;
  provider?: string;
  status: 'completed' | 'pending' | 'scheduled';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MovementRecord {
  id: string;
  date: string;
  type: 'check-out' | 'check-in' | 'transfer';
  userId: string;
  fromLocation?: string;
  toLocation?: string;
  reason?: string;
  expectedReturnDate?: string;
  notes?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'subscription' | 'task' | 'reminder' | 'maintenance' | 'license';
  relatedProductId?: string;
  color?: string;
  createdAt: string;
}

export interface InternActivity {
  id: string;
  internId: string;
  startDate: string;
  endDate?: string;
  description: string;
  category: 'maintenance' | 'support' | 'inventory' | 'other';
  duration?: number; // in minutes
  status: 'in-progress' | 'completed' | 'pending-review' | 'approved' | 'rejected';
  feedback?: string;
  rejectionReason?: string;
  createdAt: string;
  completedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'checklist';
  color?: string;
  isPublic: boolean;
  userId: string;
  checklistItems?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category: 'work' | 'personal' | 'social' | 'financial' | 'other';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded file data
  uploadedAt: string;
}

export interface TicketTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  transferredAt: string;
  respondedAt?: string;
}

export interface Ticket {
  id: string;
  problem: string;
  supervisor: string;
  operator: string;
  company: string;
  anydeskAccess: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  assignedTo?: string;
  attendedBy?: string;
  attendedAt?: string;
  responseTime?: number; // in minutes
  closedAt?: string;
  closingFeedback?: string;
  attachments: TicketAttachment[];
  transfers: TicketTransfer[];
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ReportFilter {
  categoryId?: string;
  status?: string;
  lowStock?: boolean;
  startDate?: string;
  endDate?: string;
  type?: string;
  location?: string;
  department?: string;
  branch?: string;
  lifecycleStatus?: string;
  internId?: string;
  activityCategory?: string;
  activityStatus?: string;
}