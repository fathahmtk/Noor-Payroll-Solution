import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Employee, PayrollRun, CompanySettings } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import DownloadIcon from '../icons/DownloadIcon';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  payrollRun: PayrollRun | null;
  companySettings: CompanySettings | null;
}

const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, employee, payrollRun, companySettings }) => {
  const payslipRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = payslipRef.current;
    if (!element || !employee || !payrollRun) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payslip_${payrollRun.month}_${payrollRun.year}_${employee.name.replace(/\s/g, '_')}.pdf`);
  };

  if (!employee || !payrollRun || !companySettings) {
    return null;
  }

  const netPay = employee.basicSalary + employee.allowances - employee.deductions;

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>Close</Button>
      <Button icon={<DownloadIcon />} onClick={handleDownloadPDF}>Download PDF</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payslip for ${employee.name}`} footer={modalFooter}>
        <div ref={payslipRef} className="p-4 bg-white text-black font-sans">
            <div className="border-b-2 border-black pb-2 mb-4">
                <h1 className="text-2xl font-bold">{companySettings.companyName}</h1>
                <p className="text-xs">Establishment ID: {companySettings.establishmentId}</p>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">PAYSLIP</h2>
                <div className="text-right">
                    <p className="font-bold">Pay Period:</p>
                    <p className="text-sm">{payrollRun.month} {payrollRun.year}</p>
                </div>
            </div>

            <div className="border rounded-md p-3 mb-4">
                <h3 className="font-bold mb-2">Employee Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><span className="text-gray-600">Name:</span> {employee.name}</div>
                    <div><span className="text-gray-600">Position:</span> {employee.position}</div>
                    <div><span className="text-gray-600">QID:</span> {employee.qid}</div>
                    <div><span className="text-gray-600">Department:</span> {employee.department}</div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                    <h3 className="font-bold border-b mb-2 pb-1">Earnings</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Basic Salary</span> <span>QAR {employee.basicSalary.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Allowances</span> <span>QAR {employee.allowances.toFixed(2)}</span></div>
                    </div>
                     <div className="flex justify-between font-bold border-t mt-2 pt-1 text-sm"><span>Total Earnings</span> <span>QAR {(employee.basicSalary + employee.allowances).toFixed(2)}</span></div>
                </div>
                 <div className="border rounded-md p-3">
                    <h3 className="font-bold border-b mb-2 pb-1">Deductions</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Standard Deductions</span> <span>QAR {employee.deductions.toFixed(2)}</span></div>
                    </div>
                     <div className="flex justify-between font-bold border-t mt-2 pt-1 text-sm"><span>Total Deductions</span> <span>QAR {employee.deductions.toFixed(2)}</span></div>
                </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-center">
                <p className="font-bold text-lg">NET PAY</p>
                <p className="font-bold text-2xl">QAR {netPay.toFixed(2)}</p>
            </div>
            
            <div className="text-xs text-gray-500 mt-4 text-center">
                This is a computer-generated document and does not require a signature.
            </div>
        </div>
    </Modal>
  );
};

export default PayslipModal;
