import type { 
    Employee, PayrollRun, CompanySettings, User, AttendanceRecord, 
    LeaveRequest, EmployeeDocument, CompanyAsset, LeaveBalance, 
    AssetMaintenance, Payslip, InviteUser, LeaveBalanceDetail as LBDType, 
    OnboardingTask, OffboardingTask, ContractDetails, Tenant, Role, Permission,
    JobOpening, Candidate, CandidateStatus
} from '../types';
import { generateSIFContent } from '../utils/wpsUtils';
import { getDaysBetween } from '../utils/dateUtils';

// Export type for external usage
export type LeaveBalanceDetail = LBDType;

// --- MULTI-TENANT MOCK DATABASE ---
let tenants = new Map<string, Tenant>();
let users = new Map<string, User[]>();
let employees = new Map<string, Employee[]>();
let payrollRuns = new Map<string, PayrollRun[]>();
let companySettings = new Map<string, CompanySettings>();
let attendanceRecords = new Map<string, AttendanceRecord[]>();
let leaveRequests = new Map<string, LeaveRequest[]>();
let leaveBalances = new Map<string, LeaveBalance[]>();
let documents = new Map<string, EmployeeDocument[]>();
let companyAssets = new Map<string, CompanyAsset[]>();
let assetMaintenances = new Map<string, AssetMaintenance[]>();
let payslips = new Map<string, Payslip[]>();
let roles = new Map<string, Role[]>();
let jobOpenings = new Map<string, JobOpening[]>();
let candidates = new Map<string, Candidate[]>();

// Global data (not tenant-specific)
let permissions: Permission[] = [
    { id: 'dashboard:view', name: 'View Dashboard', group: 'Dashboard' },
    { id: 'employees:read', name: 'View Employees', group: 'Employees' },
    { id: 'employees:create', name: 'Create Employees', group: 'Employees' },
    { id: 'employees:update', name: 'Update Employees', group: 'Employees' },
    { id: 'employees:delete', name: 'Delete Employees', group: 'Employees' },
    { id: 'payroll:run', name: 'Run Payroll', group: 'Payroll' },
    { id: 'payroll:read', name: 'View Payroll History', group: 'Payroll' },
    { id: 'recruitment:manage', name: 'Manage Recruitment', group: 'Recruitment' },
    { id: 'settings:manage', name: 'Manage Company Settings', group: 'Settings' },
    { id: 'roles:manage', name: 'Manage Roles & Permissions', group: 'Settings' },
    { id: 'users:manage', name: 'Manage Users', group: 'Settings' },
    { id: 'reports:view', name: 'View Analytics & Reports', group: 'Reports' },
];
const verificationCodes = new Map<string, { code: string; expires: number }>();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const generateMockDataForTenant = (tenantId: string, owner: User, hrRole: Role, employeeRole: Role) => {
    const mockEmployees: Employee[] = [
        { id: 'emp-1', name: 'Fatima Al-Marri', qid: '29012345678', position: 'Senior Frontend Engineer', department: 'Engineering', basicSalary: 18000, allowances: 4000, deductions: 500, bankName: 'QIB', iban: 'QA50QISB000000000000123456789', joinDate: '2022-03-15', avatarUrl: `https://i.pravatar.cc/150?u=emp-1`, tenantId, managerId: 'emp-3' },
        { id: 'emp-2', name: 'Hassan Al-Haydos', qid: '29109876543', position: 'HR Specialist', department: 'HR', basicSalary: 14000, allowances: 3000, deductions: 300, bankName: 'QNB', iban: 'QA58QNBA000000000000987654321', joinDate: '2023-01-20', avatarUrl: `https://i.pravatar.cc/150?u=emp-2`, tenantId, managerId: owner.id },
        { id: 'emp-3', name: 'Aisha Al-Kuwari', qid: '28801112233', position: 'Engineering Manager', department: 'Engineering', basicSalary: 25000, allowances: 6000, deductions: 1000, bankName: 'Dukhan Bank', iban: 'QA21DUKH000000000000111222333', joinDate: '2021-08-01', avatarUrl: `https://i.pravatar.cc/150?u=emp-3`, tenantId, managerId: owner.id },
        { id: 'emp-4', name: 'Yousef Al-Malki', qid: '29204455667', position: 'Marketing Lead', department: 'Marketing', basicSalary: 16000, allowances: 3500, deductions: 400, bankName: 'Commercial Bank', iban: 'QA85CBQA000000000000445566778', joinDate: '2022-11-05', avatarUrl: `https://i.pravatar.cc/150?u=emp-4`, tenantId, managerId: owner.id },
        { id: 'emp-5', name: 'Noora Al-Thani', qid: '29307788990', position: 'Junior Accountant', department: 'Finance', basicSalary: 10000, allowances: 2000, deductions: 200, bankName: 'QIB', iban: 'QA60QISB000000000000778899001', joinDate: '2023-06-10', avatarUrl: `https://i.pravatar.cc/150?u=emp-5`, tenantId, managerId: owner.id },
    ];

    mockEmployees.forEach((emp, index) => {
        emp.contract = {
            startDate: emp.joinDate,
            endDate: new Date(new Date(emp.joinDate).setFullYear(new Date(emp.joinDate).getFullYear() + 2)).toISOString().split('T')[0],
            jobTitle: emp.position,
            salary: emp.basicSalary + emp.allowances,
            benefits: ['Health Insurance', 'Annual Air Ticket'],
        };
        emp.onboardingTasks = [
            { id: `ontask-${emp.id}-1`, description: 'Sign Employment Contract', completed: true, dueDate: new Date(new Date(emp.joinDate).setDate(new Date(emp.joinDate).getDate() + 1)).toISOString().split('T')[0] },
            { id: `ontask-${emp.id}-2`, description: 'IT Equipment Setup', completed: index % 2 === 0, dueDate: new Date(new Date(emp.joinDate).setDate(new Date(emp.joinDate).getDate() + 2)).toISOString().split('T')[0] },
            { id: `ontask-${emp.id}-3`, description: 'Bank Account Setup', completed: true, dueDate: new Date(new Date(emp.joinDate).setDate(new Date(emp.joinDate).getDate() + 5)).toISOString().split('T')[0] },
        ];
        emp.offboardingTasks = [
             { id: `offtask-${emp.id}-1`, description: 'Return Company Assets', completed: false, responsible: 'Employee' },
             { id: `offtask-${emp.id}-2`, description: 'Knowledge Transfer Session', completed: false, responsible: 'Manager' },
             { id: `offtask-${emp.id}-3`, description: 'Conduct Exit Interview', completed: false, responsible: 'HR' },
        ]
    });

    employees.set(tenantId, mockEmployees);

    // Link owner and create HR user
    const hrUser: User = { id: `user-hr`, username: 'hr@noor.app', name: 'Abdullah Al-Sada', role: hrRole, tenantId, companyName: owner.companyName, employeeId: 'emp-2', avatarUrl: `https://i.pravatar.cc/150?u=hr@noor.app` };
    users.set(tenantId, [owner, hrUser]);


    const today = new Date();
    const mockDocs: EmployeeDocument[] = [
        { id: 'doc-1', employeeId: 'emp-1', employeeName: 'Fatima Al-Marri', documentType: 'QID', issueDate: '2022-04-01', expiryDate: new Date(today.setDate(today.getDate() + 25)).toISOString().split('T')[0], s3_key: 'key1', version: 2, tenantId },
        { id: 'doc-2', employeeId: 'emp-2', employeeName: 'Hassan Al-Haydos', documentType: 'Passport', issueDate: '2021-10-10', expiryDate: '2026-10-09', s3_key: 'key2', version: 1, tenantId },
        { id: 'doc-3', employeeId: 'emp-4', employeeName: 'Yousef Al-Malki', documentType: 'Visa', issueDate: '2022-11-01', expiryDate: new Date(today.setDate(today.getDate() - 5)).toISOString().split('T')[0], s3_key: 'key3', version: 1, tenantId },
    ];
    documents.set(tenantId, mockDocs);
    
    const mockLeaveRequests: LeaveRequest[] = [
        { id: 'leave-1', employeeId: 'emp-1', employeeName: 'Fatima Al-Marri', startDate: '2024-08-01', endDate: '2024-08-10', leaveType: 'Annual', reason: 'Vacation', status: 'Approved', tenantId },
        { id: 'leave-2', employeeId: 'emp-5', employeeName: 'Noora Al-Thani', startDate: new Date(today.setDate(today.getDate() + 40)).toISOString().split('T')[0], endDate: new Date(today.setDate(today.getDate() + 42)).toISOString().split('T')[0], leaveType: 'Annual', reason: 'Personal', status: 'Pending', tenantId },
        { id: 'leave-3', employeeId: 'emp-4', employeeName: 'Yousef Al-Malki', startDate: '2024-06-10', endDate: '2024-06-11', leaveType: 'Sick', reason: 'Flu', status: 'Approved', tenantId },
    ];
    leaveRequests.set(tenantId, mockLeaveRequests);

    const mockBalances: LeaveBalance[] = mockEmployees.map(emp => ({
        id: `bal-${emp.id}`, employeeId: emp.id, employeeName: emp.name, tenantId,
        balances: [
            { leaveType: 'Annual', totalDays: 21, usedDays: emp.id === 'emp-1' ? 10 : (emp.id === 'emp-4' ? 5 : 0) },
            { leaveType: 'Sick', totalDays: 14, usedDays: emp.id === 'emp-4' ? 2 : 0 },
            { leaveType: 'Unpaid', totalDays: 0, usedDays: 0 },
            { leaveType: 'Maternity', totalDays: 50, usedDays: 0 },
        ]
    }));
    leaveBalances.set(tenantId, mockBalances);
    
    const mockAssets: CompanyAsset[] = [
        { id: 'asset-1', assetTag: 'QT-LAP-001', name: 'MacBook Pro 16"', category: 'IT Equipment', serialNumber: 'C02F1234ABCD', purchaseDate: '2023-01-15', purchaseCost: 9500, residualValue: 1000, depreciationMethod: 'Straight-line', usefulLifeMonths: 36, vendor: 'iSpot', warrantyEndDate: '2026-01-14', location: 'Doha Office', status: 'Assigned', assignedToEmployeeId: 'emp-1', assignmentDate: '2023-01-20', tenantId },
        { id: 'asset-2', assetTag: 'QT-PHN-001', name: 'iPhone 15 Pro', category: 'IT Equipment', serialNumber: 'A12B3456CDEF', purchaseDate: '2023-09-22', purchaseCost: 4500, residualValue: 500, depreciationMethod: 'Straight-line', usefulLifeMonths: 24, vendor: 'Ooredoo', warrantyEndDate: '2025-09-21', location: 'Doha Office', status: 'Assigned', assignedToEmployeeId: 'emp-3', assignmentDate: '2023-09-25', tenantId },
        { id: 'asset-3', assetTag: 'QT-VEH-001', name: 'Toyota Land Cruiser', category: 'Vehicle', serialNumber: 'JT1234567890', purchaseDate: '2022-05-10', purchaseCost: 220000, residualValue: 80000, depreciationMethod: 'Straight-line', usefulLifeMonths: 60, vendor: 'Toyota Qatar', warrantyEndDate: '2027-05-09', location: 'Company Parking', status: 'Available', tenantId },
    ];
    companyAssets.set(tenantId, mockAssets);

    const mockMaintenance: AssetMaintenance[] = [
        { id: 'maint-1', assetId: 'asset-3', assetName: 'Toyota Land Cruiser', maintenanceType: 'Check-up', description: 'Annual 40,000km service.', cost: 850, date: '2024-05-15', status: 'Completed', tenantId }
    ];
    assetMaintenances.set(tenantId, mockMaintenance);

    const tenantSettings = companySettings.get(tenantId)!;
    const months = ['June', 'May', 'April', 'March'];
    const currentYear = new Date().getFullYear();
    const mockPayrollRuns: PayrollRun[] = months.map((month, i) => {
        const totalAmount = mockEmployees.reduce((sum, emp) => sum + emp.basicSalary + emp.allowances - emp.deductions, 0);
        const runDate = new Date();
        runDate.setMonth(runDate.getMonth() - (i+1));
        return {
            id: `pr-${i+1}`, tenantId, month, year: currentYear,
            runDate: runDate.toISOString(),
            totalAmount: totalAmount + (Math.random() * 1000 - 500), // slight variation
            employeeCount: mockEmployees.length, status: 'Completed',
            wpsFileContent: generateSIFContent(tenantSettings, mockEmployees, month, currentYear)
        }
    });
    payrollRuns.set(tenantId, mockPayrollRuns);

    const mockPayslips: Payslip[] = [];
    mockPayrollRuns.forEach(run => {
        mockEmployees.forEach(emp => {
            mockPayslips.push({
                id: `ps-${run.id}-${emp.id}`, employeeId: emp.id, period: `${run.month} ${run.year}`,
                grossSalary: emp.basicSalary + emp.allowances,
                netSalary: emp.basicSalary + emp.allowances - emp.deductions,
                downloadUrl: '#', createdAt: run.runDate, tenantId,
            });
        });
    });
    payslips.set(tenantId, mockPayslips);
    
    const mockJob: JobOpening = { id: 'job-1', title: 'Senior Backend Engineer', department: 'Engineering', location: 'Doha, Qatar', status: 'Open', description: 'Looking for a skilled backend developer...', datePosted: '2024-05-20T10:00:00Z', tenantId };
    jobOpenings.set(tenantId, [mockJob]);
    
    const mockCandidates: Candidate[] = [
        { id: 'cand-1', name: 'Khalid Al-Abdullah', email: 'khalid@test.com', phone: '33445566', jobOpeningId: 'job-1', jobTitle: 'Senior Backend Engineer', status: 'Interview', appliedDate: '2024-05-22T14:00:00Z', resumeUrl: '#', avatarUrl: `https://i.pravatar.cc/150?u=cand-1`, tenantId },
        { id: 'cand-2', name: 'Sara Mahmoud', email: 'sara@test.com', phone: '55667788', jobOpeningId: 'job-1', jobTitle: 'Senior Backend Engineer', status: 'Applied', appliedDate: '2024-06-01T09:00:00Z', resumeUrl: '#', avatarUrl: `https://i.pravatar.cc/150?u=cand-2`, tenantId },
    ];
    candidates.set(tenantId, mockCandidates);

    // Generate mock attendance records for the last month
    const mockAttendance: AttendanceRecord[] = [];
    const todayForAttendance = new Date();
    const lastMonth = new Date(todayForAttendance);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const employeesForAttendance = mockEmployees.filter(e => e.id === 'emp-1' || e.id === 'emp-3' || e.id === 'emp-4');

    for (let d = new Date(lastMonth); d <= todayForAttendance; d.setDate(d.getDate() + 1)) {
        // Skip weekends (Friday and Saturday in Qatar)
        if (d.getDay() === 5 || d.getDay() === 6) {
            continue;
        }

        employeesForAttendance.forEach(emp => {
            // Randomly skip some days to make it realistic
            if (Math.random() > 0.9) return;

            const checkInHour = 8 + Math.floor(Math.random() * 2) - 1; // 7, 8, or 9
            const checkInMinute = Math.floor(Math.random() * 30);
            const checkOutHour = 17 + Math.floor(Math.random() * 2) - 1; // 16, 17, or 18
            const checkOutMinute = Math.floor(Math.random() * 59);

            const checkIn = `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}`;
            const checkOut = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}`;
            
            const dateStr = new Date(d).toISOString().split('T')[0];
            
            const checkInDate = new Date(`${dateStr}T${checkIn}`);
            const checkOutDate = new Date(`${dateStr}T${checkOut}`);
            const hoursWorked = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);

            mockAttendance.push({
                id: `att-${emp.id}-${dateStr}`,
                employeeId: emp.id,
                employeeName: emp.name,
                date: dateStr,
                checkIn: checkIn,
                checkOut: checkOut,
                hoursWorked: Math.max(0, hoursWorked), // Ensure no negative hours
                tenantId,
            });
        });
    }
    attendanceRecords.set(tenantId, mockAttendance);
};

// --- DATA INITIALIZATION ---
const initTenantData = (tenantId: string, companyName: string, owner: User) => {
    // Default roles for the new tenant
    const ownerRole: Role = { id: `role-${tenantId}-owner`, name: 'Owner', permissions: permissions.map(p => p.id) };
    const hrRole: Role = { id: `role-${tenantId}-hr`, name: 'HR Manager', permissions: ['dashboard:view', 'employees:read', 'employees:create', 'employees:update', 'recruitment:manage', 'reports:view', 'settings:manage'] };
    const employeeRole: Role = { id: `role-${tenantId}-employee`, name: 'Employee', permissions: [] };
    roles.set(tenantId, [ownerRole, hrRole, employeeRole]);

    // Initialize data stores for the new tenant
    users.set(tenantId, [owner]);
    companySettings.set(tenantId, {
        tenantId,
        companyName,
        establishmentId: `EST-${String(Date.now()).slice(-5)}`,
        bankName: 'Qatar National Bank',
        corporateAccountNumber: `QA58QNBA000000000000${String(Date.now()).slice(-10)}`,
    });
    
    // Generate Rich Mock Data
    generateMockDataForTenant(tenantId, owner, hrRole, employeeRole);
};


// --- AUTH & REGISTRATION API ---
export const registerCompanyAndUser = async (companyName: string, userName: string, userEmail: string): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    const existingUser = Array.from(users.values()).flat().some(u => u.username.toLowerCase() === userEmail.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const tenantId = `tenant-${String(Date.now()).slice(-6)}`;
    const newTenant: Tenant = { id: tenantId, name: companyName };
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

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(userEmail.toLowerCase(), { code, expires: Date.now() + 300000 }); // 5 min expiry
    
    console.log(`Verification code for ${userEmail}: ${code}`);
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
    return user || null;
};


// --- TENANT-AWARE API FUNCTIONS ---

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

export const addEmployee = async (tenantId: string, employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'tenantId'>): Promise<Employee> => {
  await delay(500);
  const newEmployee: Employee = {
    id: `emp-${String(Date.now()).slice(-4)}`,
    avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/100/100`,
    tenantId,
    ...employeeData,
  };
  const currentEmployees = employees.get(tenantId) || [];
  employees.set(tenantId, [...currentEmployees, newEmployee]);
  return newEmployee;
};

export const updateEmployee = async (tenantId: string, employeeData: Employee): Promise<Employee> => {
  await delay(500);
  const currentEmployees = employees.get(tenantId) || [];
  employees.set(tenantId, currentEmployees.map(emp => emp.id === employeeData.id ? employeeData : emp));
  return employeeData;
};

export const deleteEmployee = async (tenantId: string, employeeId: string): Promise<void> => {
  await delay(500);
  const currentEmployees = employees.get(tenantId) || [];
  employees.set(tenantId, currentEmployees.filter(emp => emp.id !== employeeId));
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

export const createRole = async (tenantId: string, roleData: Omit<Role, 'id'>): Promise<Role> => {
    await delay(400);
    const newRole: Role = { id: `role-${tenantId}-${Date.now()}`, ...roleData };
    const currentRoles = roles.get(tenantId) || [];
    roles.set(tenantId, [...currentRoles, newRole]);
    return newRole;
};

export const updateRole = async (tenantId: string, roleData: Role): Promise<Role> => {
    await delay(400);
    const currentRoles = roles.get(tenantId) || [];
    roles.set(tenantId, currentRoles.map(r => r.id === roleData.id ? roleData : r));
    // Also update any user currently assigned this role
    const currentUsers = users.get(tenantId) || [];
    users.set(tenantId, currentUsers.map(u => u.role.id === roleData.id ? { ...u, role: roleData } : u));
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
    return updatedUser;
};


export const inviteUser = async (tenantId: string, companyName: string, userData: InviteUser): Promise<User> => {
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
    return newUser;
};


// Payroll
export const getPayrollRuns = async (tenantId: string): Promise<PayrollRun[]> => {
    await delay(400);
    const runs = payrollRuns.get(tenantId) || [];
    return [...runs].sort((a,b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime());
};

export const runPayroll = async (tenantId: string, month: string, year: number): Promise<{ payrollRun: PayrollRun; wpsFileContent: string; }> => {
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
    return newDocument;
}

export const deleteDocument = async (tenantId: string, documentId: string): Promise<void> => {
    await delay(500);
    const currentDocs = documents.get(tenantId) || [];
    documents.set(tenantId, currentDocs.filter(doc => doc.id !== documentId));
}

export const getEmployeeDocuments = async (tenantId: string, employeeId: string): Promise<EmployeeDocument[]> => {
    await delay(200);
    return (documents.get(tenantId) || []).filter(doc => doc.employeeId === employeeId);
}

// Assets
export const getAssets = async (tenantId: string): Promise<CompanyAsset[]> => {
    await delay(300);
    const currentAssets = companyAssets.get(tenantId) || [];
    const tenantEmployees = employees.get(tenantId) || [];
    return currentAssets.map(asset => {
        if(asset.assignedToEmployeeId) {
            const emp = tenantEmployees.find(e => e.id === asset.assignedToEmployeeId);
            return {...asset, assignedToEmployeeName: emp?.name};
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
    return newAsset;
}

export const updateAsset = async (tenantId: string, assetData: CompanyAsset): Promise<CompanyAsset> => {
    await delay(500);
    const currentAssets = companyAssets.get(tenantId) || [];
    companyAssets.set(tenantId, currentAssets.map(asset => asset.id === assetData.id ? assetData : asset));
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
    return newRecord;
}

export const getLeaveRequests = async (tenantId: string): Promise<LeaveRequest[]> => {
    await delay(300);
    return [...(leaveRequests.get(tenantId) || [])];
}

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

    return updatedRequest;
}

export const getLeaveBalances = async (tenantId: string): Promise<LeaveBalance[]> => {
    await delay(200);
    return [...(leaveBalances.get(tenantId) || [])];
}

export const updateLeaveBalance = async (tenantId: string, updatedBalance: LeaveBalance): Promise<LeaveBalance> => {
    await delay(400);
    const currentBalances = leaveBalances.get(tenantId) || [];
    const newBalances = currentBalances.map(b => b.id === updatedBalance.id ? updatedBalance : b);
    leaveBalances.set(tenantId, newBalances);
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
    return updatedCandidate;
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