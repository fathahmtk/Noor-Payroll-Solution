export enum SubscriptionTier {
  Free = 'free',
  Premium = 'premium',
  Enterprise = 'enterprise',
}

export enum EmployeeStatus {
  Active = 'Active',
  OnLeave = 'On Leave',
  Terminated = 'Terminated',
  Transferred = 'Transferred',
}

export enum SponsorshipType {
  Company = 'Company',
  Personal = 'Personal',
}

export enum VisaType {
  WorkVisa = 'Work Visa',
  FamilyVisa = 'Family Visa',
  InvestorVisa = 'Investor Visa',
}


export interface Tenant {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
}

export interface Permission {
  id: string; // e.g., 'employees:create'
  name: string; // e.g., 'Create Employees'
  group: string; // e.g., 'Employees'
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // Array of permission IDs
}

export interface User {
    id: string;
    username: string; // email
    name: string;
    role: Role; // Embed the full role object
    employeeId?: string; // Link to employee record if the user is an employee
    avatarUrl?: string;
    tenantId: string;
    companyName: string; // Denormalized for easy display
}

export interface ContractDetails {
  startDate: string;
  endDate: string;
  jobTitle: string;
  salary: number;
  benefits: string[];
}

export interface OnboardingTask {
  id: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

export interface OffboardingTask {
  id: string;
  description: string;
  completed: boolean;
  responsible: 'HR' | 'Manager' | 'Employee';
}

export interface Employee {
  id: string;
  name: string;
  nameAr?: string;
  qid: string;
  position: string;
  department: 'Engineering' | 'HR' | 'Marketing' | 'Sales' | 'Finance';
  basicSalary: number;
  allowances: number;
  deductions: number;
  bankName: string;
  iban: string;
  joinDate: string;
  avatarUrl: string;
  managerId?: string;
  tenantId: string;
  _candidateId?: string; // To link back to the candidate record upon conversion
  // Lifecycle properties
  contract?: ContractDetails;
  onboardingTasks?: OnboardingTask[];
  offboardingTasks?: OffboardingTask[];
  // Qatar-specific compliance fields
  status: EmployeeStatus;
  sponsorship: SponsorshipType;
  visaType: VisaType;
  residencyStatus: string; // e.g., "Valid RP", "In Process"
}

export interface PayrollRun {
  id: string;
  month: string;
  year: number;
  runDate: string;
  totalAmount: number;
  employeeCount: number;
  status: 'Completed' | 'Pending';
  wpsFileContent?: string;
  tenantId: string;
}

export interface CompanySettings {
  companyName: string;
  establishmentId: string;
  bankName: string;
  corporateAccountNumber: string;
  tenantId: string;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string; // YYYY-MM-DD
    checkIn: string; // HH:MM
    checkOut: string; // HH:MM
    hoursWorked: number;
    tenantId: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Unpaid' | 'Maternity';

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    leaveType: LeaveType;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    tenantId: string;
}

export interface LeaveBalanceDetail {
    leaveType: LeaveType;
    totalDays: number;
    usedDays: number;
}

export interface LeaveBalance {
    id: string;
    employeeId: string;
    employeeName: string;
    balances: LeaveBalanceDetail[];
    tenantId: string;
}

export interface EmployeeDocument {
    id: string;
    employeeId: string;
    employeeName: string;
    documentType: 'QID' | 'Passport' | 'Visa' | 'Labor Contract' | 'Other';
    issueDate: string; // YYYY-MM-DD
    expiryDate: string; // YYYY-MM-DD
    s3_key: string;
    version: number;
    tenantId: string;
}

export interface CompanyAsset {
  id: string;
  assetTag: string;
  name: string;
  category: 'IT Equipment' | 'Furniture' | 'Vehicle' | 'Other';
  serialNumber: string;
  purchaseDate: string; // YYYY-MM-DD
  purchaseCost: number;
  residualValue: number;
  depreciationMethod: 'Straight-line' | 'None';
  usefulLifeMonths: number;
  vendor: string;
  warrantyEndDate: string; // YYYY-MM-DD
  location: string;
  status: 'Available' | 'Assigned' | 'In Repair' | 'Retired';
  assignedToEmployeeId?: string;
  assignmentDate?: string; // YYYY-MM-DD
  tenantId: string;
}

export interface AssetMaintenance {
    id: string;
    assetId: string;
    assetName: string;
    maintenanceType: 'Repair' | 'Upgrade' | 'Check-up';
    description: string;
    cost: number;
    date: string; // YYYY-MM-DD
    status: 'Open' | 'In Progress' | 'Completed';
    tenantId: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string; // e.g., "June 2024"
  grossSalary: number;
  netSalary: number;
  downloadUrl: string; // a mock url
  createdAt: string;
  tenantId: string;
}

export interface JobOpening {
    id: string;
    title: string;
    department: Employee['department'];
    location: string;
    status: 'Open' | 'Closed';
    description: string;
    datePosted: string;
    tenantId: string;
}

export type CandidateStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected' | 'Converted';

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    jobOpeningId: string;
    jobTitle: string; // Denormalized for easy display
    status: CandidateStatus;
    appliedDate: string;
    resumeUrl: string; // Mock URL
    avatarUrl: string;
    tenantId: string;
}

export interface CompanyVehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    registrationExpiry: string; // Istimara
    insuranceExpiry: string;
    assignedToEmployeeId?: string;
    tenantId: string;
}

export interface VehicleLog {
    id: string;
    vehicleId: string;
    vehicleName: string; // Denormalized
    employeeId: string;
    employeeName: string; // Denormalized
    date: string;
    startMileage: number;
    endMileage: number;
    purpose: string;
    fuelCost?: number;
    tenantId: string;
}

export interface PettyCashTransaction {
    id: string;
    department: Employee['department'];
    employeeId: string;
    employeeName: string;
    date: string;
    description: string;
    type: 'Expense' | 'Reimbursement' | 'Top-up';
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    tenantId: string;
}

export interface PayslipEarnings {
  basicSalary: number;
  allowances: number;
  leaveEncashment?: number;
  gratuity?: number;
  [key: string]: number | undefined; // For other earnings
}

export interface PayslipDeductions {
  standardDeductions: number;
  otherDeductions?: number;
  [key: string]: number | undefined; // For other deductions
}

export interface PayslipData {
    type: 'Monthly' | 'Leave' | 'Final Settlement';
    employee: Employee;
    companySettings: CompanySettings;
    period: string;
    payDate: string;
    earnings: PayslipEarnings;
    deductions: PayslipDeductions;
    calculationDetails?: string[];
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    tenantId: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    subject: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Closed';
    createdAt: string;
    tenantId: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  tenantId: string;
}


export enum View {
  Dashboard = 'Dashboard',
  Employees = 'Employees',
  EmployeeProfile = 'Employee Profile',
  OrganizationChart = 'Organization Chart',
  Directory = 'Company Directory',
  Recruitment = 'Recruitment',
  Payroll = 'Payroll & WPS',
  PPP = 'PPP Loan Calculator',
  TimeAttendance = 'Time & Attendance',
  Documents = 'Document Management',
  Assets = 'Asset Management',
  VehicleManagement = 'Vehicle Management',
  PettyCash = 'Petty Cash',
  KnowledgeBase = 'Knowledge Base',
  LaborLawCompliance = 'Labor Law Compliance',
  AnalyticsReports = 'Analytics & Reports',
  AuditTrail = 'Audit Trail',
  MyProfile = 'My Profile',
  Settings = 'Settings',
  HelpSupport = 'Help & Support',
  EmployeeDashboard = 'My Dashboard',
  ManagerDashboard = 'Manager Dashboard',
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface InviteUser {
    name: string;
    username: string; // email
    roleId: string;
}

export type Theme = 'light' | 'dark';

export interface AppContextType {
    openModal: (modal: 'addEmployee' | 'editEmployee' | 'deleteEmployee' | 'runPayroll' | 'viewWPSPayslip' | 'generatePayslip' | 'requestLeave' | 'inviteUser' | 'editUser' | 'createRole' | 'editRole' | 'addJobOpening' | 'addCandidate' | 'viewCandidate' | 'addMaintenance' | 'addVehicle' | 'addVehicleLog' | 'addPettyCash' | 'addArticle' | 'editArticle' | 'deleteArticle', data?: any) => void;
    closeModal: () => void;
    employees: Employee[] | null;
    refreshEmployees: () => Promise<void>;
    loading: boolean;
    currentUser: User | null;
    tenant: Tenant | null;
    refreshTenant: () => Promise<void>;
    isManager: boolean;
    theme: Theme;
    toggleTheme: () => void;
}

export interface ContactRequest {
  id: string;
  company?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  createdAt: string;
}