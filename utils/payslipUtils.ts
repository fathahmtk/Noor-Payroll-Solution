import type { Employee, PayslipData, PayslipEarnings, PayslipDeductions, LeaveBalance } from '../types';

export const calculateGratuity = (employee: Employee, lastWorkingDay: string): { yearsOfService: number; gratuityAmount: number } => {
    const joinDate = new Date(employee.joinDate);
    const endDate = new Date(lastWorkingDay);
    if (endDate < joinDate) return { yearsOfService: 0, gratuityAmount: 0 };

    const yearsOfService = (endDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (yearsOfService < 1) return { yearsOfService, gratuityAmount: 0 };

    const gratuityRateWeeks = 3;
    const dailyWage = employee.basicSalary / 30;
    const weeklyWage = dailyWage * 7;
    const gratuityAmount = weeklyWage * gratuityRateWeeks * yearsOfService;

    return { yearsOfService, gratuityAmount };
};

export const calculateMonthlyPayslip = (employee: Employee): PayslipData => {
    const earnings: PayslipEarnings = {
        basicSalary: employee.basicSalary,
        allowances: employee.allowances,
    };
    const deductions: PayslipDeductions = {
        standardDeductions: employee.deductions,
    };
    return {
        type: 'Monthly',
        employee,
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        payDate: new Date().toISOString().split('T')[0],
        earnings,
        deductions,
        companySettings: {} as any // This will be populated in the modal
    };
};

export const calculateLeaveSalaryPayslip = (employee: Employee, leaveStartDate: string, leaveEndDate: string): PayslipData => {
    // This is a simplified calculation. A real system might prorate based on the month.
    const earnings: PayslipEarnings = {
        basicSalary: employee.basicSalary,
        allowances: employee.allowances,
    };
    const deductions: PayslipDeductions = {
        standardDeductions: employee.deductions,
    };
     return {
        type: 'Leave',
        employee,
        period: `Leave Salary: ${new Date(leaveStartDate).toLocaleDateString()} to ${new Date(leaveEndDate).toLocaleDateString()}`,
        payDate: new Date().toISOString().split('T')[0],
        earnings,
        deductions,
        companySettings: {} as any,
        calculationDetails: [`This payslip reflects the salary paid for an upcoming leave period.`]
    };
};

export const calculateFinalSettlementPayslip = (
    employee: Employee, 
    lastWorkingDay: string, 
    leaveBalance: LeaveBalance | null
): PayslipData => {
    const endDate = new Date(lastWorkingDay);
    const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    const workedDays = endDate.getDate();
    
    // Pro-rata salary for the final month
    const proRataBasic = (employee.basicSalary / daysInMonth) * workedDays;
    const proRataAllowances = (employee.allowances / daysInMonth) * workedDays;

    // Leave Encashment
    const annualLeave = leaveBalance?.balances.find(b => b.leaveType === 'Annual');
    const unusedLeaveDays = annualLeave ? annualLeave.totalDays - annualLeave.usedDays : 0;
    const dailyRate = employee.basicSalary / 30;
    const leaveEncashment = unusedLeaveDays > 0 ? dailyRate * unusedLeaveDays : 0;

    // Gratuity
    const { yearsOfService, gratuityAmount } = calculateGratuity(employee, lastWorkingDay);

    const earnings: PayslipEarnings = {
        basicSalary: proRataBasic,
        allowances: proRataAllowances,
        leaveEncashment: leaveEncashment,
        gratuity: gratuityAmount,
    };
    const deductions: PayslipDeductions = {
        standardDeductions: (employee.deductions / daysInMonth) * workedDays, // Pro-rata deductions
    };

    return {
        type: 'Final Settlement',
        employee,
        period: `Final Settlement as of ${new Date(lastWorkingDay).toLocaleDateString()}`,
        payDate: new Date().toISOString().split('T')[0],
        earnings,
        deductions,
        companySettings: {} as any,
        calculationDetails: [
            `Pro-rated salary for ${workedDays} days in ${endDate.toLocaleString('default', { month: 'long' })}.`,
            `Encashment for ${unusedLeaveDays.toFixed(2)} unused annual leave days.`,
            `End-of-service gratuity for ${yearsOfService.toFixed(2)} years of service.`
        ]
    };
};
