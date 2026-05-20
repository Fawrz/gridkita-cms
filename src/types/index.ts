// GridKita domain types — turunan langsung dari PRD §4.4

export type Role = "CLIENT" | "DESIGNER" | "ADMIN";

export type OrderStatus =
  | "QUOTE_REQUESTED"
  | "QUOTE_OFFERED"
  | "PENDING_PAYMENT"
  | "WAITING_VERIFICATION"
  | "PAID"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "REVISION"
  | "DONE"
  | "DELIVERED"
  | "CANCELLED";

export type OrderType = "PACKAGE" | "CUSTOM";

export type PaymentStatus = "PENDING" | "WAITING" | "APPROVED" | "REJECTED";

export type PayrollStatus = "ACCRUED" | "PAID_OUT";

export type CashFlowType = "INCOME" | "EXPENSE";

export type CashFlowSource =
  | "ORDER_PAYMENT"
  | "COMMISSION_SHARE"
  | "RECURRING_EXPENSE"
  | "MANUAL";

export type NotificationType =
  | "ORDER_NEW"
  | "PAYMENT_NEW"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_REJECTED"
  | "ORDER_ASSIGNED"
  | "ORDER_REVISION"
  | "ORDER_DONE"
  | "ORDER_DELIVERED"
  | "QUOTE_NEW"
  | "QUOTE_OFFERED"
  | "DELIVERABLE_UPLOADED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  bankAccount?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  category: string;
  coverUrl: string;
  images: { url: string; caption?: string }[];
  createdById: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface ServicePackage {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  basePrice: number;
  estimatedDays: number;
  thumbnailUrl: string;
  isActive: boolean;
  isPopular?: boolean;
}

export interface BriefData {
  projectName: string;
  goals: string;
  targetAudience?: string;
  styleNotes?: string;
  colorPreferences?: string;
  deadline?: string;
  extra?: Record<string, string>;
}

export interface OrderAttachment {
  id: string;
  orderId: string;
  url: string;
  name: string;
  uploadedById: string;
  kind: "BRIEF" | "REFERENCE";
  uploadedAt: string;
}

export interface Order {
  id: string;
  code: string; // GK-2026-0001
  clientId: string;
  designerId?: string;
  type: OrderType;
  servicePackageId?: string;
  customDescription?: string;
  quotedPrice?: number;
  finalPrice: number;
  status: OrderStatus;
  revisionCount: number;
  adminApprovedDeliverable: boolean;
  brief: BriefData;
  attachments: OrderAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedById: string;
  changedAt: string;
  note?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  qrisImageUrl: string;
  proofImageUrl?: string;
  status: PaymentStatus;
  verifiedById?: string;
  verifiedAt?: string;
  rejectReason?: string;
  uploadedAt?: string;
}

export interface Deliverable {
  id: string;
  orderId: string;
  designerId: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface PayrollEntry {
  id: string;
  orderId: string;
  designerId: string;
  orderTotal: number;
  commissionAmount: number; // 70%
  companyShare: number; // 30%
  status: PayrollStatus;
  accruedAt: string;
  paidOutAt?: string;
  payoutBatchId?: string;
}

export interface PayoutBatch {
  id: string;
  periodMonth: string; // YYYY-MM
  totalAmount: number;
  processedById: string;
  processedAt: string;
  note?: string;
  entryIds: string[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isOperational: boolean;
}

export interface RecurringExpense {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  recurrenceDay: number; // 1-28
  isActive: boolean;
  lastGeneratedAt?: string;
}

export interface CashFlow {
  id: string;
  type: CashFlowType;
  source: CashFlowSource;
  categoryId?: string;
  amount: number;
  description: string;
  occurredAt: string;
  sourceOrderId?: string;
  sourceRecurringId?: string;
  recordedById: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
