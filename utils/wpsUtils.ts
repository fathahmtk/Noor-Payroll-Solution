import type { CompanySettings, Employee } from '../types';

/**
 * Generates the content for a Wage Protection System (WPS) Salary Information File (SIF)
 * compliant with Qatar regulations.
 * @param settings - The company's settings.
 * @param employees - The list of employees included in this payroll run.
 * @param month - The payroll month (e.g., "July").
 * @param year - The payroll year (e.g., 2024).
 * @returns A string containing the SIF file content.
 */
export const generateSIFContent = (
    settings: CompanySettings,
    employees: Employee[],
    month: string,
    year: number
): string => {
    const totalNetAmount = employees.reduce((acc, emp) => acc + emp.basicSalary + emp.allowances - emp.deductions, 0);
    
    // Header Record (H)
    const headerRecord = [
        settings.establishmentId,
        `${year}${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, '0')}`,
        totalNetAmount.toFixed(2),
        employees.length
    ].join(',');

    // Detail Records (D)
    const detailRecords = employees.map(emp => {
        const netSalary = emp.basicSalary + emp.allowances - emp.deductions;
        const narration = `Salary for ${month} ${year}`;
        return [
            emp.qid,
            emp.iban.replace(/\s/g, ''), // Employee Account (IBAN)
            emp.name,                     // Employee Name
            emp.basicSalary.toFixed(2),   // Basic Salary
            emp.allowances.toFixed(2),    // Allowances
            emp.deductions.toFixed(2),    // Deductions
            netSalary.toFixed(2),         // Net Salary
            emp.qid,                      // Employee Reference Number (as per standard practice)
            'SAL',                        // Payment Type (SAL for Salary)
            narration                     // Narration / Notes
        ].join(',');
    }).join('\n');

    return `${headerRecord}\n${detailRecords}`;
};