import type { 
    Employee, PayrollRun, CompanySettings, User, AttendanceRecord, 
    LeaveRequest, EmployeeDocument, CompanyAsset, LeaveBalance, 
    AssetMaintenance, Payslip, InviteUser, LeaveBalanceDetail as LBDType, 
    OnboardingTask, OffboardingTask, ContractDetails, Tenant, Role, Permission,
    JobOpening, Candidate, CandidateStatus, CompanyVehicle, VehicleLog, PettyCashTransaction,
    AuditLog, ContactRequest, SupportTicket, KnowledgeBaseArticle
} from '../types.ts';
import { SubscriptionTier, EmployeeStatus, SponsorshipType, VisaType } from '../types.ts';
import { generateSIFContent } from '../utils/wpsUtils.ts';
import { getDaysBetween } from '../utils/dateUtils.ts';

// Export type for external usage
export type LeaveBalanceDetail = LBDType;


// --- PERSISTENCE LOGIC ---
const DB_KEY = 'noor-hr-database-v1';

// Global data (not tenant-specific)
export let permissions: Permission[] = [
    { id: 'dashboard:view', name: 'View Dashboard', group: 'Dashboard' },
    { id: 'employees:read', name: 'View Employees', group: 'Employees' },
    { id: 'employees:create', name: 'Create Employees', group: 'Employees' },
    { id: 'employees:update', name: 'Update Employees', group: 'Employees' },
    { id: 'employees:delete', name: 'Delete Employees', group: 'Employees' },
    { id: 'payroll:run', name: 'Run Payroll', group: 'Payroll' },
    { id: 'payroll:read', name: 'View Payroll History', group: 'Payroll' },
    { id: 'recruitment:manage', name: 'Manage Recruitment', group: 'Recruitment' },
    { id: 'operations:manage', name: 'Manage Operations (Assets, Vehicles, etc.)', group: 'Operations'},
    { id: 'settings:manage', name: 'Manage Company Settings', group: 'Settings' },
    { id: 'roles:manage', name: 'Manage Roles & Permissions', group: 'Settings' },
    { id: 'users:manage', name: 'Manage Users', group: 'Settings' },
    { id: 'reports:view', name: 'View Analytics & Reports', group: 'Reports' },
    { id: 'knowledgebase:manage', name: 'Manage Knowledge Base', group: 'Administration' },
];
export let verificationCodes = new Map<string, { code: string; expires: number }>();

// Helper for JSON serialization/deserialization of Map objects
const replacer = (key: any, value: any) => {
    if (value instanceof Map) {
        return { __type: 'Map', data: Array.from(value.entries()) };
    }
    return value;
};

const reviver = (key: any, value: any) => {
    if (typeof value === 'object' && value !== null && value.__type === 'Map') {
        return new Map(value.data);
    }
    return value;
};

// --- MULTI-TENANT MOCK DATABASE ---
export let tenants = new Map<string, Tenant>();
export let users = new Map<string, User[]>();
export let employees = new Map<string, Employee[]>();
export let payrollRuns = new Map<string, PayrollRun[]>();
export let companySettings = new Map<string, CompanySettings>();
export let attendanceRecords = new Map<string, AttendanceRecord[]>();
export let leaveRequests = new Map<string, LeaveRequest[]>();
export let leaveBalances = new Map<string, LeaveBalance[]>();
export let documents = new Map<string, EmployeeDocument[]>();
export let companyAssets = new Map<string, CompanyAsset[]>();
export let assetMaintenances = new Map<string, AssetMaintenance[]>();
export let payslips = new Map<string, Payslip[]>();
export let roles = new Map<string, Role[]>();
export let jobOpenings = new Map<string, JobOpening[]>();
export let candidates = new Map<string, Candidate[]>();
export let companyVehicles = new Map<string, CompanyVehicle[]>();
export let vehicleLogs = new Map<string, VehicleLog[]>();
export let pettyCashTransactions = new Map<string, PettyCashTransaction[]>();
export let auditLogs = new Map<string, AuditLog[]>();
export let contactRequests = new Map<string, ContactRequest[]>();
export let supportTickets = new Map<string, SupportTicket[]>();
export let knowledgeBaseArticles = new Map<string, KnowledgeBaseArticle[]>();

const allMaps = {
    tenants, users, employees, payrollRuns, companySettings, attendanceRecords,
    leaveRequests, leaveBalances, documents, companyAssets, assetMaintenances,
    payslips, roles, jobOpenings, candidates, companyVehicles, vehicleLogs,
    pettyCashTransactions, auditLogs, verificationCodes, contactRequests, supportTickets,
    knowledgeBaseArticles
};

const saveStateToStorage = () => {
    try {
        const serializedState = JSON.stringify(allMaps, replacer);
        localStorage.setItem(DB_KEY, serializedState);
    } catch (error) {
        console.error("Error saving state to localStorage", error);
    }
};

const addAuditLog = async (tenantId: string, user: { id: string; name: string }, action: string, details: string) => {
  const logEntry: AuditLog = {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action,
    details,
    tenantId,
  };
  const currentLogs = auditLogs.get(tenantId) || [];
  auditLogs.set(tenantId, [logEntry, ...currentLogs]);
};


const initTenantData = (tenantId: string, companyName: string, owner: User) => {
    // Default roles for the new tenant
    const ownerRole: Role = { id: `role-${tenantId}-owner`, name: 'Owner', permissions: permissions.map(p => p.id) };
    const hrRole: Role = { id: `role-${tenantId}-hr`, name: 'HR Manager', permissions: ['dashboard:view', 'employees:read', 'employees:create', 'employees:update', 'recruitment:manage', 'operations:manage', 'reports:view', 'settings:manage', 'knowledgebase:manage'] };
    const employeeRole: Role = { id: `role-${tenantId}-employee`, name: 'Employee', permissions: [] };
    roles.set(tenantId, [ownerRole, hrRole, employeeRole]);

    // Initialize data stores for the new tenant
    users.set(tenantId, [owner]);
    companySettings.set(tenantId, {
        tenantId,
        companyName,
        establishmentId: '',
        bankName: '',
        corporateAccountNumber: '',
    });
    
    // Initialize empty arrays for all data types for the new tenant
    employees.set(tenantId, []);
    documents.set(tenantId, []);
    leaveRequests.set(tenantId, []);
    leaveBalances.set(tenantId, []);
    companyAssets.set(tenantId, []);
    assetMaintenances.set(tenantId, []);
    payrollRuns.set(tenantId, []);
    payslips.set(tenantId, []);
    jobOpenings.set(tenantId, []);
    candidates.set(tenantId, []);
    companyVehicles.set(tenantId, []);
    vehicleLogs.set(tenantId, []);
    pettyCashTransactions.set(tenantId, []);
    attendanceRecords.set(tenantId, []);
    auditLogs.set(tenantId, []);
    supportTickets.set(tenantId, []);
    knowledgeBaseArticles.set(tenantId, []);
};

const loadStateFromStorage = async () => {
    try {
        const storedState = localStorage.getItem(DB_KEY);
        if (storedState) {
            const parsedState = JSON.parse(storedState, reviver);
            // Repopulate maps to keep exported references valid
            for (const key in allMaps) {
                if (Object.prototype.hasOwnProperty.call(allMaps, key)) {
                    const map = allMaps[key as keyof typeof allMaps];
                    const parsedData = parsedState[key];
                    map.clear();
                    if (parsedData instanceof Map) {
                        parsedData.forEach((v: any, k: any) => map.set(k, v));
                    }
                }
            }
        }

        // Ensure a demo user for Google login always exists
        const googleDemoUserEmail = 'demouser@google.com';
        const googleUserExists = Array.from(users.values()).flat().some(u => u.username === googleDemoUserEmail);
        
        if (!googleUserExists) {
            console.log("Creating Google demo user...");
            
            const tenantId = 'tenant-google-demo';
            const companyName = 'Demo Company';
            
            const newTenant: Tenant = { id: tenantId, name: companyName, subscriptionTier: SubscriptionTier.Enterprise };
            tenants.set(tenantId, newTenant);

            const ownerRole: Role = { id: `role-${tenantId}-owner`, name: 'Owner', permissions: permissions.map(p => p.id) };
            
            const ownerUser: User = {
                id: `user-google-demo`,
                username: googleDemoUserEmail,
                name: 'Demo User',
                role: ownerRole,
                tenantId: tenantId,
                companyName: companyName,
                avatarUrl: `https://i.pravatar.cc/100?u=${googleDemoUserEmail}`
            };
            
            initTenantData(tenantId, companyName, ownerUser);
            saveStateToStorage();
        }

        // Ensure a demo user for Microsoft login always exists
        const microsoftDemoUserEmail = 'demouser@microsoft.com';
        const microsoftUserExists = Array.from(users.values()).flat().some(u => u.username === microsoftDemoUserEmail);

        if (!microsoftUserExists) {
            console.log("Creating Microsoft demo user...");
            
            const tenantId = 'tenant-microsoft-demo';
            const companyName = 'MSFT Solutions';
            
            const newTenant: Tenant = { id: tenantId, name: companyName, subscriptionTier: SubscriptionTier.Premium };
            tenants.set(tenantId, newTenant);

            const ownerRole: Role = { id: `role-${tenantId}-owner`, name: 'Owner', permissions: permissions.map(p => p.id) };
            
            const ownerUser: User = {
                id: `user-microsoft-demo`,
                username: microsoftDemoUserEmail,
                name: 'MSFT Demo User',
                role: ownerRole,
                tenantId: tenantId,
                companyName: companyName,
                avatarUrl: `https://i.pravatar.cc/100?u=${microsoftDemoUserEmail}`
            };
            
            initTenantData(tenantId, companyName, ownerUser);
            saveStateToStorage();
        }

    } catch (error) {
        console.error("Error loading state from localStorage", error);
        // Avoid wiping storage on arbitrary errors, which could be transient.
        // localStorage.removeItem(DB_KEY);
    }
};

// Load the database from storage when the module is first imported
loadStateFromStorage();


export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- AUTH & REGISTRATION API ---
export const registerCompanyAndUser = async (companyName: string, userName: string, userEmail: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const existingUser = Array.from(users.values()).flat().some(u => u.username.toLowerCase() === userEmail.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const tenantId = `tenant-${String(Date.now()).slice(-6)}`;
    const newTenant: Tenant = { id: tenantId, name: companyName, subscriptionTier: SubscriptionTier.Free };
    tenants.set(tenantId, newTenant);
    
    const ownerRole: Role = { id: `role-${tenantId}-owner`, name: 'Owner', permissions: permissions.map(p => p.id) };
    
    const ownerUser: User = {
        id: `user-${String(Date.now()).slice(-4)}`,
        username: userEmail,
        name: userName,
        role: ownerRole,
        tenantId: tenantId,
        companyName: companyName,
        avatarUrl: `https://i.pravatar.cc/100?u=${userEmail}`
    };
    
    initTenantData(tenantId, companyName, ownerUser);
    
    await addAuditLog(tenantId, ownerUser, 'Registered Company', `New company '${companyName}' was registered.`);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(userEmail.toLowerCase(), { code, expires: Date.now() + 300000 }); // 5 min expiry
    
    console.log(`Verification code for ${userEmail}: ${code}`);
    saveStateToStorage();
    return { success: true, message: `Verification code sent to ${userEmail}. It is: ${code}` };
};

export const requestLoginCode = async (email: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const userExists = Array.from(users.values()).flat().some(u => u.username.toLowerCase() === email.toLowerCase());
    if (!userExists) {
        return { success: false, message: 'No account found with that email.' };
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email.toLowerCase(), { code, expires: Date.now() + 300000 }); // 5 min expiry

    console.log(`Verification code for ${email}: ${code}`);
    saveStateToStorage();
    return { success: true, message: `Verification code sent to ${email}. It is: ${code}` };
};

export const verifyLoginCode = async (email: string, code: string): Promise<User | null> => {
    await delay(500);
    const stored = verificationCodes.get(email.toLowerCase());
    if (!stored || stored.code !== code || stored.expires < Date.now()) {
        return null;
    }
    
    verificationCodes.delete(email.toLowerCase());
    const user = Array.from(users.values()).flat().find(u => u.username.toLowerCase() === email.toLowerCase());
    if (user) {
        await addAuditLog(user.tenantId, user, 'User Login', 'User logged in successfully.');
        saveStateToStorage();
    }
    return user || null;
};

export const loginWithGoogle = async (): Promise<User | null> => {
    await delay(700); // Simulate network request
    const googleDemoUserEmail = 'demouser@google.com';
    const user = Array.from(users.values()).flat().find(u => u.username === googleDemoUserEmail);
    if (user) {
        await addAuditLog(user.tenantId, user, 'User Login', 'User logged in successfully via Google.');
        saveStateToStorage();
    }
    return user || null;
}

export const loginWithMicrosoft = async (): Promise<User | null> => {
    await delay(700); // Simulate network request
    const microsoftDemoUserEmail = 'demouser@microsoft.com';
    const user = Array.from(users.values()).flat().find(u => u.username === microsoftDemoUserEmail);
    if (user) {
        await addAuditLog(user.tenantId, user, 'User Login', 'User logged in successfully via Microsoft.');
        saveStateToStorage();
    }
    return user || null;
}

// --- PUBLIC/LANDING PAGE API ---
export const submitContactRequest = async (data: Omit<ContactRequest, 'id' | 'createdAt' | 'company' | 'phone' | 'message'> & { company?: string, phone?: string, message?: string }): Promise<ContactRequest> => {
    await delay(700);
    const publicTenantId = 'public-contact-requests';
    const newRequest: ContactRequest = {
        id: `contact-${Date.now()}`,
        createdAt: new Date().toISOString(),
        company: data.company || '',
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        message: data.message || '',
    };
    const currentRequests = contactRequests.get(publicTenantId) || [];
    contactRequests.set(publicTenantId, [...currentRequests, newRequest]);
    saveStateToStorage();
    return newRequest;
};


// --- TENANT-AWARE API FUNCTIONS ---

// Tenant
export const getTenant = async (tenantId: string): Promise<Tenant | null> => {
    await delay(100);
    return tenants.get(tenantId) || null;
}

export const updateSubscriptionTier = async (tenantId: string, tier: SubscriptionTier): Promise<Tenant> => {
    await delay(400);
    const tenant = tenants.get(tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const updatedTenant = { ...tenant, subscriptionTier: tier };
    tenants.set(tenantId, updatedTenant);
    saveStateToStorage();
    return updatedTenant;
}

// Employees
export const getEmployees = async (tenantId: string): Promise<Employee[]> => {
  await delay(300);
  return [...(employees.get(tenantId) || [])];
};

export const getEmployeeById = async (tenantId: string, id: string): Promise<Employee | null> => {
    await delay(200);
    const employee = (employees.get(tenantId) || []).find(e => e.id === id);
    return employee ? { ...employee } : null;
}

export const addEmployee = async (tenantId: string, employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'tenantId'>, user: { id: string; name: string }): Promise<Employee> => {
  await delay(500);
  const newEmployee: Employee = {
    id: `emp-${String(Date.now()).slice(-4)}`,
    avatarUrl: `https://i.pravatar.cc/100?u=${`emp-${String(Date.now()).slice(-4)}`}`,
    tenantId,
    status: EmployeeStatus.Active,
    sponsorship: SponsorshipType.Company,
    visaType: VisaType.WorkVisa,
    residencyStatus: 'Valid RP',
    ...employeeData,
  };
  const currentEmployees = employees.get(tenantId) || [];
  employees.set(tenantId, [...currentEmployees, newEmployee]);
  await addAuditLog(tenantId, user, 'Added Employee', `Created new employee: ${newEmployee.name} (${newEmployee.position}).`);
  saveStateToStorage();
  return newEmployee;
};

export const updateEmployee = async (tenantId: string, employeeData: Employee): Promise<Employee> => {
  await delay(500);
  const currentEmployees = employees.get(tenantId) || [];
  employees.set(tenantId, currentEmployees.map(emp => emp.id === employeeData.id ? employeeData : emp));
  saveStateToStorage();
  return employeeData;
};

export const deleteEmployee = async (tenantId: string, employeeId: string, employeeName: string, user: { id: string; name: string }): Promise<void> => {
  await delay(500);
  const currentEmployees = employees.get(tenantId) || [];
  employees.set(tenantId, currentEmployees.filter(emp => emp.id !== employeeId));
  await addAuditLog(tenantId, user, 'Deleted Employee', `Deleted employee: ${employeeName}.`);
  saveStateToStorage();
};

// Roles & Permissions
export const getRoles = async (tenantId: string): Promise<Role[]> => {
    await delay(200);
    return [...(roles.get(tenantId) || [])];
}

export const getPermissions = async (): Promise<Permission[]> => {
    await delay(100);
    return [...permissions];
}

export const createRole = async (tenantId: string, roleData: Omit<Role, 'id'>, user: { id: string; name: string }): Promise<Role> => {
    await delay(400);
    const newRole: Role = { id: `role-${tenantId}-${Date.now()}`, ...roleData };
    const currentRoles = roles.get(tenantId) || [];
    roles.set(tenantId, [...currentRoles, newRole]);
    await addAuditLog(tenantId, user, 'Created Role', `Created new role: ${newRole.name}.`);
    saveStateToStorage();
    return newRole;
};

export const updateRole = async (tenantId: string, roleData: Role, user: { id: string; name: string }): Promise<Role> => {
    await delay(400);
    const currentRoles = roles.get(tenantId) || [];
    roles.set(tenantId, currentRoles.map(r => r.id === roleData.id ? roleData : r));
    const currentUsers = users.get(tenantId) || [];
    users.set(tenantId, currentUsers.map(u => u.role.id === roleData.id ? { ...u, role: roleData } : u));
    await addAuditLog(tenantId, user, 'Updated Role', `Updated permissions for role: ${roleData.name}.`);
    saveStateToStorage();
    return roleData;
}

// Users
export const getUsers = async (tenantId: string): Promise<User[]> => {
    await delay(300);
    return [...(users.get(tenantId) || [])];
};

export const updateUser = async (tenantId: string, userData: Pick<User, 'id' | 'name' | 'role'>): Promise<User> => {
    await delay(400);
    let updatedUser: User | undefined;
    const currentUsers = users.get(tenantId) || [];
    users.set(tenantId, currentUsers.map(u => {
        if (u.id === userData.id) {
            updatedUser = { ...u, name: userData.name, role: userData.role };
            return updatedUser;
        }
        return u;
    }));
    if (!updatedUser) throw new Error("User not found");
    saveStateToStorage();
    return updatedUser;
};


export const inviteUser = async (tenantId: string, companyName: string, userData: InviteUser, user: { id: string; name: string }): Promise<User> => {
    await delay(500);
    const role = (roles.get(tenantId) || []).find(r => r.id === userData.roleId);
    if (!role) throw new Error("Role not found");

    const newUser: User = {
        id: `user-${String(Date.now()).slice(-4)}`,
        avatarUrl: `https://i.pravatar.cc/100?u=${userData.username}`,
        username: userData.username,
        name: userData.name,
        role: role,
        tenantId: tenantId,
        companyName: companyName,
    };
    const currentUsers = users.get(tenantId) || [];
    users.set(tenantId, [...currentUsers, newUser]);
    await addAuditLog(tenantId, user, 'Invited User', `Invited ${userData.name} (${userData.username}) with role '${role.name}'.`);
    saveStateToStorage();
    return newUser;
};


// Payroll
export const getPayrollRuns = async (tenantId: string): Promise<PayrollRun[]> => {
    await delay(400);
    const runs = payrollRuns.get(tenantId) || [];
    return [...runs].sort((a,b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime());
};

export const runPayroll = async (tenantId: string, month: string, year: number, user: { id: string; name: string }): Promise<{ payrollRun: PayrollRun; wpsFileContent: string; }> => {
    await delay(1500);
    const tenantEmployees = employees.get(tenantId) || [];
    const tenantSettings = companySettings.get(tenantId);
    if (!tenantSettings) throw new Error("Company settings not found.");

    const totalAmount = tenantEmployees.reduce((sum, emp) => sum + emp.basicSalary + emp.allowances - emp.deductions, 0);
    const wpsFileContent = generateSIFContent(tenantSettings, tenantEmployees, month, year);

    const newRun: PayrollRun = {
        id: `pr-${String(Date.now()).slice(-4)}`,
        tenantId,
        month,
        year,
        runDate: new Date().toISOString(),
        totalAmount,
        employeeCount: tenantEmployees.length,
        status: 'Completed',
        wpsFileContent,
    };
    const currentRuns = payrollRuns.get(tenantId) || [];
    payrollRuns.set(tenantId, [newRun, ...currentRuns]);
    await addAuditLog(tenantId, user, 'Ran Payroll', `Processed payroll for ${month} ${year} for ${tenantEmployees.length} employees.`);
    saveStateToStorage();
    return { payrollRun: newRun, wpsFileContent };
};

export const getLatestPayrollRun = async(tenantId: string): Promise<PayrollRun | null> => {
    await delay(100);
    const runs = payrollRuns.get(tenantId) || [];
    if (runs.length === 0) return null;
    return [...runs].sort((a,b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime())[0];
}

// Settings
export const getCompanySettings = async (tenantId: string): Promise<CompanySettings> => {
    await delay(200);
    const settings = companySettings.get(tenantId);
    if (!settings) throw new Error("Settings not found for tenant");
    return { ...settings };
};

export const updateCompanySettings = async (tenantId: string, settings: CompanySettings): Promise<CompanySettings> => {
    await delay(500);
    companySettings.set(tenantId, settings);
    saveStateToStorage();
    return { ...settings };
};

// Documents
export const getDocuments = async (tenantId: string): Promise<EmployeeDocument[]> => {
    await delay(300);
    return [...(documents.get(tenantId) || [])];
};

export const addDocument = async (tenantId: string, docData: Omit<EmployeeDocument, 'id' | 'employeeName' | 'tenantId'>): Promise<EmployeeDocument> => {
    await delay(500);
    const employee = (employees.get(tenantId) || []).find(e => e.id === docData.employeeId);
    if (!employee) throw new Error("Employee not found");

    const newDocument: EmployeeDocument = {
        id: `doc-${Date.now()}`,
        employeeName: employee.name,
        tenantId,
        ...docData
    };
    const currentDocs = documents.get(tenantId) || [];
    documents.set(tenantId, [...currentDocs, newDocument]);
    saveStateToStorage();
    return newDocument;
}

export const deleteDocument = async (tenantId: string, documentId: string): Promise<void> => {
    await delay(500);
    const currentDocs = documents.get(tenantId) || [];
    documents.set(tenantId, currentDocs.filter(doc => doc.id !== documentId));
    saveStateToStorage();
}

export const getEmployeeDocuments = async (tenantId: string, employeeId: string): Promise<EmployeeDocument[]> => {
    await delay(200);
    return (documents.get(tenantId) || []).filter(doc => doc.employeeId === employeeId);
}

// Assets
export const getAssets = async (tenantId: string): Promise<(CompanyAsset & { assignedToEmployeeName?: string })[]> => {
    await delay(300);
    const currentAssets: CompanyAsset[] = companyAssets.get(tenantId) || [];
    const tenantEmployees: Employee[] = employees.get(tenantId) || [];
    
    return currentAssets.map(asset => {
        if(asset.assignedToEmployeeId) {
            const emp = tenantEmployees.find(e => e.id === asset.assignedToEmployeeId);
            return { ...asset, assignedToEmployeeName: emp?.name };
        }
        return asset;
    });
}

export const addAsset = async (tenantId: string, assetData: Omit<CompanyAsset, 'id' | 'tenantId'>): Promise<CompanyAsset> => {
    await delay(500);
    const newAsset: CompanyAsset = {
        id: `asset-${Date.now()}`,
        tenantId,
        ...assetData
    };
    const currentAssets = companyAssets.get(tenantId) || [];
    companyAssets.set(tenantId, [...currentAssets, newAsset]);
    saveStateToStorage();
    return newAsset;
}

export const updateAsset = async (tenantId: string, assetData: CompanyAsset): Promise<CompanyAsset> => {
    await delay(500);
    const currentAssets = companyAssets.get(tenantId) || [];
    companyAssets.set(tenantId, currentAssets.map(asset => asset.id === assetData.id ? assetData : asset));
    saveStateToStorage();
    return assetData;
}

export const getAssetMaintenances = async (tenantId: string): Promise<AssetMaintenance[]> => {
    await delay(300);
    return [...(assetMaintenances.get(tenantId) || [])];
}

export const getAssetsByEmployeeId = async (tenantId: string, employeeId: string): Promise<(CompanyAsset & { assignedToEmployeeName?: string })[]> => {
    await delay(300);
    const emp = (employees.get(tenantId) || []).find(e => e.id === employeeId);
    return (companyAssets.get(tenantId) || []).filter(asset => asset.assignedToEmployeeId === employeeId).map(asset => ({...asset, assignedToEmployeeName: emp?.name}));
};

export const addAssetMaintenance = async (tenantId: string, maintenanceData: Omit<AssetMaintenance, 'id' | 'assetName' | 'tenantId'>): Promise<AssetMaintenance> => {
    await delay(500);
    const asset = (companyAssets.get(tenantId) || []).find(a => a.id === maintenanceData.assetId);
    if (!asset) throw new Error("Asset not found");

    const newMaintenance: AssetMaintenance = {
        id: `maint-${Date.now()}`,
        assetName: asset.name,
        tenantId,
        ...maintenanceData
    };
    const currentMaintenances = assetMaintenances.get(tenantId) || [];
    assetMaintenances.set(tenantId, [...currentMaintenances, newMaintenance]);
    saveStateToStorage();
    return newMaintenance;
};

// Attendance & Leave
export const getAttendanceRecords = async (tenantId: string): Promise<AttendanceRecord[]> => {
    await delay(300);
    const records = attendanceRecords.get(tenantId) || [];
    return [...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const addAttendanceRecord = async (tenantId: string, recordData: Omit<AttendanceRecord, 'id' | 'hoursWorked' | 'employeeName' | 'tenantId'>): Promise<AttendanceRecord> => {
    await delay(400);
    const employee = (employees.get(tenantId) || []).find(e => e.id === recordData.employeeId);
    if (!employee) throw new Error("Employee not found");

    const checkIn = new Date(`${recordData.date}T${recordData.checkIn}`);
    const checkOut = new Date(`${recordData.date}T${recordData.checkOut}`);
    const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeName: employee.name,
        hoursWorked: hoursWorked > 0 ? hoursWorked : 0,
        tenantId,
        ...recordData
    };
    const currentRecords = attendanceRecords.get(tenantId) || [];
    attendanceRecords.set(tenantId, [...currentRecords, newRecord]);
    saveStateToStorage();
    return newRecord;
}

export const getLeaveRequests = async (tenantId: string): Promise<LeaveRequest[]> => {
    await delay(300);
    return [...(leaveRequests.get(tenantId) || [])];
}

export const getEmployeeLeaveRequests = async (tenantId: string, employeeId: string): Promise<LeaveRequest[]> => {
    await delay(200);
    const requests = leaveRequests.get(tenantId) || [];
    return requests.filter(req => req.employeeId === employeeId)
                   .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

export const addLeaveRequest = async (tenantId: string, requestData: Omit<LeaveRequest, 'id' | 'status' | 'employeeName' | 'tenantId'>): Promise<LeaveRequest> => {
    await delay(400);
    const employee = (employees.get(tenantId) || []).find(e => e.id === requestData.employeeId);
    if (!employee) throw new Error("Employee not found");

    const newRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        employeeName: employee.name,
        status: 'Pending',
        tenantId,
        ...requestData
    };
    const currentRequests = leaveRequests.get(tenantId) || [];
    leaveRequests.set(tenantId, [...currentRequests, newRequest]);
    saveStateToStorage();
    return newRequest;
}

export const updateLeaveRequestStatus = async (tenantId: string, requestId: string, status: 'Approved' | 'Rejected'): Promise<LeaveRequest> => {
    await delay(500);
    const currentRequests = leaveRequests.get(tenantId) || [];
    let updatedRequest: LeaveRequest | undefined;
    const updatedRequests = currentRequests.map(req => {
        if (req.id === requestId) {
            updatedRequest = { ...req, status };
            return updatedRequest;
        }
        return req;
    });
    if (!updatedRequest) throw new Error("Leave request not found");
    
    leaveRequests.set(tenantId, updatedRequests);
    
    if (status === 'Approved') {
        const currentBalances = leaveBalances.get(tenantId) || [];
        const days = getDaysBetween(updatedRequest.startDate, updatedRequest.endDate);
        const updatedBalances = currentBalances.map(bal => {
            if (bal.employeeId === updatedRequest!.employeeId) {
                const newBalances = bal.balances.map(b => {
                    if (b.leaveType === updatedRequest!.leaveType) {
                        return { ...b, usedDays: b.usedDays + days };
                    }
                    return b;
                });
                return { ...bal, balances: newBalances };
            }
            return bal;
        });
        leaveBalances.set(tenantId, updatedBalances);
    }

    saveStateToStorage();
    return updatedRequest;
}

export const getLeaveBalances = async (tenantId: string): Promise<LeaveBalance[]> => {
    await delay(200);
    return [...(leaveBalances.get(tenantId) || [])];
}

export const getEmployeeLeaveBalance = async (tenantId: string, employeeId: string): Promise<LeaveBalance | null> => {
    await delay(150);
    const balance = (leaveBalances.get(tenantId) || []).find(b => b.employeeId === employeeId);
    return balance || null;
}

export const updateLeaveBalance = async (tenantId: string, updatedBalance: LeaveBalance): Promise<LeaveBalance> => {
    await delay(400);
    const currentBalances = leaveBalances.get(tenantId) || [];
    const newBalances = currentBalances.map(b => b.id === updatedBalance.id ? updatedBalance : b);
    leaveBalances.set(tenantId, newBalances);
    saveStateToStorage();
    return updatedBalance;
}

export const getEmployeePayslips = async (tenantId: string, employeeId: string): Promise<Payslip[]> => {
    await delay(300);
    return (payslips.get(tenantId) || []).filter(p => p.employeeId === employeeId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Lifecycle Management
export const updateOnboardingTaskStatus = async (tenantId: string, employeeId: string, taskId: string, completed: boolean): Promise<OnboardingTask[]> => {
    await delay(300);
    const tenantEmployees = employees.get(tenantId) || [];
    let updatedTasks: OnboardingTask[] = [];
    const newEmployees = tenantEmployees.map(emp => {
        if (emp.id === employeeId) {
            const tasks = emp.onboardingTasks?.map(task => 
                task.id === taskId ? { ...task, completed } : task
            ) || [];
            updatedTasks = tasks;
            return { ...emp, onboardingTasks: tasks };
        }
        return emp;
    });
    employees.set(tenantId, newEmployees);
    saveStateToStorage();
    return updatedTasks;
};

export const updateOffboardingTaskStatus = async (tenantId: string, employeeId: string, taskId: string, completed: boolean): Promise<OffboardingTask[]> => {
    await delay(300);
    const tenantEmployees = employees.get(tenantId) || [];
    let updatedTasks: OffboardingTask[] = [];
    const newEmployees = tenantEmployees.map(emp => {
        if (emp.id === employeeId) {
            const tasks = emp.offboardingTasks?.map(task => 
                task.id === taskId ? { ...task, completed } : task
            ) || [];
            updatedTasks = tasks;
            return { ...emp, offboardingTasks: tasks };
        }
        return emp;
    });
    employees.set(tenantId, newEmployees);
    saveStateToStorage();
    return updatedTasks;
};

export const updateContractDetails = async (tenantId: string, employeeId: string, contractDetails: ContractDetails): Promise<ContractDetails> => {
    await delay(400);
    const tenantEmployees = employees.get(tenantId) || [];
    const newEmployees = tenantEmployees.map(emp => {
        if (emp.id === employeeId) {
            return { ...emp, contract: contractDetails };
        }
        return emp;
    });
    employees.set(tenantId, newEmployees);
    saveStateToStorage();
    return contractDetails;
}

// Recruitment
export const getJobOpenings = async (tenantId: string): Promise<JobOpening[]> => {
    await delay(300);
    return [...(jobOpenings.get(tenantId) || [])];
};

export const addJobOpening = async (tenantId: string, jobData: Omit<JobOpening, 'id' | 'datePosted' | 'tenantId'>): Promise<JobOpening> => {
    await delay(500);
    const newJob: JobOpening = {
        id: `job-${Date.now()}`,
        datePosted: new Date().toISOString(),
        tenantId,
        ...jobData,
    };
    const currentJobs = jobOpenings.get(tenantId) || [];
    jobOpenings.set(tenantId, [newJob, ...currentJobs]);
    saveStateToStorage();
    return newJob;
};

export const getCandidates = async (tenantId: string): Promise<Candidate[]> => {
    await delay(400);
    return [...(candidates.get(tenantId) || [])];
};

export const addCandidate = async (tenantId: string, candidateData: Omit<Candidate, 'id' | 'appliedDate' | 'avatarUrl' | 'tenantId' | 'jobTitle'>): Promise<Candidate> => {
    await delay(500);
    const job = (jobOpenings.get(tenantId) || []).find(j => j.id === candidateData.jobOpeningId);
    if (!job) throw new Error("Job opening not found");

    const newCandidate: Candidate = {
        id: `cand-${Date.now()}`,
        appliedDate: new Date().toISOString(),
        avatarUrl: `https://i.pravatar.cc/100?u=${candidateData.email}`,
        tenantId,
        jobTitle: job.title,
        ...candidateData
    };
    const currentCandidates = candidates.get(tenantId) || [];
    candidates.set(tenantId, [...currentCandidates, newCandidate]);
    saveStateToStorage();
    return newCandidate;
};

export const updateCandidateStatus = async (tenantId: string, candidateId: string, newStatus: CandidateStatus): Promise<Candidate> => {
    await delay(300);
    const currentCandidates = candidates.get(tenantId) || [];
    let updatedCandidate: Candidate | undefined;
    const newCandidates = currentCandidates.map(c => {
        if (c.id === candidateId) {
            updatedCandidate = { ...c, status: newStatus };
            return updatedCandidate;
        }
        return c;
    });
    if (!updatedCandidate) throw new Error("Candidate not found");
    candidates.set(tenantId, newCandidates);
    saveStateToStorage();
    return updatedCandidate;
};

// Vehicle Management
export const getVehicles = async (tenantId: string): Promise<CompanyVehicle[]> => {
    await delay(300);
    return [...(companyVehicles.get(tenantId) || [])];
}

export const addVehicle = async (tenantId: string, vehicleData: Omit<CompanyVehicle, 'id' | 'tenantId'>): Promise<CompanyVehicle> => {
    await delay(400);
    const newVehicle: CompanyVehicle = { id: `veh-${Date.now()}`, tenantId, ...vehicleData };
    const current = companyVehicles.get(tenantId) || [];
    companyVehicles.set(tenantId, [...current, newVehicle]);
    saveStateToStorage();
    return newVehicle;
}

export const updateVehicle = async (tenantId: string, vehicleData: CompanyVehicle): Promise<CompanyVehicle> => {
    await delay(400);
    const current = companyVehicles.get(tenantId) || [];
    companyVehicles.set(tenantId, current.map(v => v.id === vehicleData.id ? vehicleData : v));
    saveStateToStorage();
    return vehicleData;
}

export const getVehicleLogs = async (tenantId: string): Promise<VehicleLog[]> => {
    await delay(300);
    return [...(vehicleLogs.get(tenantId) || [])];
}

export const addVehicleLog = async (tenantId: string, logData: Omit<VehicleLog, 'id' | 'tenantId' | 'vehicleName' | 'employeeName'>): Promise<VehicleLog> => {
    await delay(400);
    const vehicle = (companyVehicles.get(tenantId) || []).find(v => v.id === logData.vehicleId);
    const employee = (employees.get(tenantId) || []).find(e => e.id === logData.employeeId);
    if (!vehicle || !employee) throw new Error("Vehicle or Employee not found");
    
    const newLog: VehicleLog = { id: `log-${Date.now()}`, tenantId, vehicleName: `${vehicle.make} ${vehicle.model}`, employeeName: employee.name, ...logData };
    const current = vehicleLogs.get(tenantId) || [];
    vehicleLogs.set(tenantId, [newLog, ...current]);
    saveStateToStorage();
    return newLog;
}

// Petty Cash
export const getPettyCashTransactions = async (tenantId: string): Promise<PettyCashTransaction[]> => {
    await delay(300);
    return [...(pettyCashTransactions.get(tenantId) || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getDepartmentBalances = async (tenantId: string): Promise<Record<Employee['department'], number>> => {
    await delay(200);
    const transactions = pettyCashTransactions.get(tenantId) || [];
    const balances = { 'Engineering': 0, 'HR': 0, 'Marketing': 0, 'Sales': 0, 'Finance': 0 };
    transactions.forEach(t => {
        if (t.status === 'Approved') {
            if (t.type === 'Top-up') {
                balances[t.department] += t.amount;
            } else {
                balances[t.department] -= t.amount;
            }
        }
    });
    return balances;
}

export const addPettyCashTransaction = async (tenantId: string, transData: Omit<PettyCashTransaction, 'id' | 'tenantId' | 'employeeName' | 'status'>): Promise<PettyCashTransaction> => {
    await delay(400);
    const employee = (employees.get(tenantId) || []).find(e => e.id === transData.employeeId);
    if (!employee) throw new Error("Employee not found");

    const newTransaction: PettyCashTransaction = { id: `pc-${Date.now()}`, tenantId, employeeName: employee.name, status: 'Pending', ...transData };
    const current = pettyCashTransactions.get(tenantId) || [];
    pettyCashTransactions.set(tenantId, [newTransaction, ...current]);
    saveStateToStorage();
    return newTransaction;
}

export const updatePettyCashStatus = async (tenantId: string, transactionId: string, status: 'Approved' | 'Rejected'): Promise<PettyCashTransaction> => {
    await delay(500);
    const current = pettyCashTransactions.get(tenantId) || [];
    let updatedTransaction: PettyCashTransaction | undefined;
    const updatedList = current.map(t => {
        if (t.id === transactionId) {
            updatedTransaction = { ...t, status };
            return updatedTransaction;
        }
        return t;
    });
    if (!updatedTransaction) throw new Error("Transaction not found");
    pettyCashTransactions.set(tenantId, updatedList);
    saveStateToStorage();
    return updatedTransaction;
}

// Audit Log
export const getAuditLogs = async (tenantId: string): Promise<AuditLog[]> => {
    await delay(300);
    return [...(auditLogs.get(tenantId) || [])];
};


// Dashboard/Alerts
export const getAlerts = async (tenantId: string): Promise<{ expiringDocs: EmployeeDocument[], pendingLeaves: LeaveRequest[] }> => {
    await delay(350);
    
    const pendingLeaves = (leaveRequests.get(tenantId) || []).filter(req => req.status === 'Pending');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const expiringDocs = (documents.get(tenantId) || []).filter(doc => {
        if (!doc.expiryDate) return false;
        const expiry = new Date(doc.expiryDate);
        return expiry < thirtyDaysFromNow;
    });

    return { expiringDocs, pendingLeaves };
};

// Manager Dashboard
export const getManagerDashboardData = async (tenantId: string, managerEmployeeId: string): Promise<{ directReports: Employee[], pendingLeaveRequests: LeaveRequest[] }> => {
    await delay(400);
    const tenantEmployees = employees.get(tenantId) || [];
    const directReports = tenantEmployees.filter(e => e.managerId === managerEmployeeId);
    const directReportIds = new Set(directReports.map(e => e.id));
    
    const tenantLeaveRequests = leaveRequests.get(tenantId) || [];
    const pendingLeaveRequests = tenantLeaveRequests.filter(req => req.status === 'Pending' && directReportIds.has(req.employeeId));
    
    return { directReports, pendingLeaveRequests };
};

// Help & Support
export const submitSupportTicket = async (tenantId: string, user: {id: string, name: string}, ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'tenantId' | 'userId' | 'userName' | 'status'>): Promise<SupportTicket> => {
    await delay(500);
    const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        createdAt: new Date().toISOString(),
        tenantId,
        userId: user.id,
        userName: user.name,
        status: 'Open',
        ...ticketData
    };
    const currentTickets = supportTickets.get(tenantId) || [];
    supportTickets.set(tenantId, [newTicket, ...currentTickets]);
    saveStateToStorage();
    return newTicket;
};

// Knowledge Base
export const getKnowledgeBaseArticles = async (tenantId: string): Promise<KnowledgeBaseArticle[]> => {
    await delay(300);
    return [...(knowledgeBaseArticles.get(tenantId) || [])].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const addKnowledgeBaseArticle = async (tenantId: string, articleData: Omit<KnowledgeBaseArticle, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>, user: { id: string; name: string }): Promise<KnowledgeBaseArticle> => {
    await delay(500);
    const now = new Date().toISOString();
    const newArticle: KnowledgeBaseArticle = {
        id: `kb-${Date.now()}`,
        tenantId,
        createdAt: now,
        updatedAt: now,
        authorId: user.id,
        authorName: user.name,
        ...articleData,
    };
    const current = knowledgeBaseArticles.get(tenantId) || [];
    knowledgeBaseArticles.set(tenantId, [newArticle, ...current]);
    await addAuditLog(tenantId, user, 'Created KB Article', `Created new article: "${newArticle.title}".`);
    saveStateToStorage();
    return newArticle;
};

export const updateKnowledgeBaseArticle = async (tenantId: string, articleData: KnowledgeBaseArticle, user: { id: string; name: string }): Promise<KnowledgeBaseArticle> => {
    await delay(500);
    const updatedArticle = { ...articleData, updatedAt: new Date().toISOString() };
    const current = knowledgeBaseArticles.get(tenantId) || [];
    knowledgeBaseArticles.set(tenantId, current.map(a => a.id === updatedArticle.id ? updatedArticle : a));
    await addAuditLog(tenantId, user, 'Updated KB Article', `Updated article: "${updatedArticle.title}".`);
    saveStateToStorage();
    return updatedArticle;
};

export const deleteKnowledgeBaseArticle = async (tenantId: string, articleId: string, user: { id: string; name: string }): Promise<void> => {
    await delay(500);
    const current = knowledgeBaseArticles.get(tenantId) || [];
    const articleToDelete = current.find(a => a.id === articleId);
    knowledgeBaseArticles.set(tenantId, current.filter(a => a.id !== articleId));
    if (articleToDelete) {
        await addAuditLog(tenantId, user, 'Deleted KB Article', `Deleted article: "${articleToDelete.title}".`);
    }
    saveStateToStorage();
};