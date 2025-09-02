

import React, { useState, useMemo } from 'react';
import type { Employee, PayrollRun } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface PayrollRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onRunPayroll: (month: string, year: number) => Promise<{ payrollRun: PayrollRun; wpsFileContent: string }>;
}

const PayrollRunModal: React.FC<PayrollRunModalProps> = ({ isOpen, onClose, employees, onRunPayroll }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [wpsFileContent, setWpsFileContent] = useState('');

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const payrollSummary = useMemo(() => {
    const totalBasic = employees.reduce((sum, emp) => sum + emp.basicSalary, 0);
    const totalAllowances = employees.reduce((sum, emp) => sum + emp.allowances, 0);
    const totalDeductions = employees.reduce((sum, emp) => sum + emp.deductions, 0);
    return {
      totalBasic,
      totalAllowances,
      totalDeductions,
      totalPayroll: totalBasic + totalAllowances - totalDeductions,
      employeeCount: employees.length,
    };
  }, [employees]);

  const handleConfirmRun = async () => {
    setIsLoading(true);
    try {
        const { wpsFileContent: generatedContent } = await onRunPayroll(currentMonth, currentYear);
        setWpsFileContent(generatedContent);
        setStep(3);
    } catch (error) {
        console.error("Failed to run payroll:", error);
        alert("An error occurred while running payroll. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([wpsFileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `WPS_${currentMonth.toUpperCase()}_${currentYear}.sif`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();
  };
  
  const handleClose = () => {
      setStep(1);
      setIsLoading(false);
      setWpsFileContent('');
      onClose();
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Selection
        return (
          <div>
            <h4 className="text-lg font-semibold mb-2">Run Payroll for {currentMonth} {currentYear}</h4>
            <p className="text-gray-600">You are about to start a new payroll run. Please confirm the period below.</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <p><span className="font-semibold">Period:</span> {currentMonth}, {currentYear}</p>
                <p><span className="font-semibold">Total Employees:</span> {employees.length}</p>
            </div>
          </div>
        );
      case 2: // Confirmation
        return (
          <div>
            <h4 className="text-lg font-semibold mb-2">Confirm Payroll Details</h4>
            <p className="text-gray-600">Please review the summary below before processing the payroll.</p>
            <div className="mt-4 space-y-2 p-4 border rounded-md">
                <div className="flex justify-between"><span className="text-gray-500">Employee Count:</span> <span className="font-semibold">{payrollSummary.employeeCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Basic Salary:</span> <span className="font-semibold">QAR {payrollSummary.totalBasic.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Allowances:</span> <span className="font-semibold">QAR {payrollSummary.totalAllowances.toLocaleString()}</span></div>
                 <div className="flex justify-between text-red-600"><span className="text-gray-500">Total Deductions:</span> <span className="font-semibold">- QAR {payrollSummary.totalDeductions.toLocaleString()}</span></div>
                <hr className="my-2"/>
                <div className="flex justify-between text-lg"><span className="font-bold text-brand-dark">Net Payroll Amount:</span> <span className="font-bold text-accent">QAR {payrollSummary.totalPayroll.toLocaleString()}</span></div>
            </div>
            <p className="text-sm text-red-600 mt-4">This action is irreversible. Once processed, the payroll for {currentMonth} {currentYear} will be finalized.</p>
          </div>
        );
      case 3: // Completion
        return (
             <div>
                <h4 className="text-lg font-semibold mb-2 text-green-600">Payroll Processed Successfully!</h4>
                <p className="text-gray-600">The payroll for {currentMonth} {currentYear} has been completed. You can now download the WPS file to submit to your bank.</p>
                <div className="mt-6 flex justify-center">
                    <Button onClick={handleDownload}>Download WPS File</Button>
                </div>
            </div>
        );
      default:
        return null;
    }
  };
  
  const getFooter = () => {
      switch(step) {
          case 1:
            return (
                <>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => setStep(2)}>Next</Button>
                </>
            );
          case 2:
             return (
                <>
                    <Button variant="secondary" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                    <Button onClick={handleConfirmRun} isLoading={isLoading}>Confirm & Run Payroll</Button>
                </>
             );
          case 3:
            return <Button variant="secondary" onClick={handleClose}>Close</Button>
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Payroll Run" footer={getFooter()}>
      {renderStep()}
    </Modal>
  );
};

export default PayrollRunModal;