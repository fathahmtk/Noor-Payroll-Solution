import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Employee, PayslipData, CompanySettings, LeaveBalance } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Payslip from './Payslip';
import { getCompanySettings, getEmployeeLeaveBalance } from '../../services/api';
import * as payslipUtils from '../../utils/payslipUtils';
import DownloadIcon from '../icons/DownloadIcon';

interface GeneratePayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

type Step = 'selectType' | 'inputs' | 'preview';
type PayslipType = 'Monthly' | 'Leave' | 'Final Settlement';

const GeneratePayslipModal: React.FC<GeneratePayslipModalProps> = ({ isOpen, onClose, employee }) => {
  const [step, setStep] = useState<Step>('selectType');
  const [payslipType, setPayslipType] = useState<PayslipType>('Monthly');
  const [inputs, setInputs] = useState({ leaveStart: '', leaveEnd: '', lastDay: new Date().toISOString().split('T')[0] });
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('selectType');
      setPayslipData(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleGeneratePreview = async () => {
    if (!employee) return;
    setLoading(true);

    const [settings, leaveBalance] = await Promise.all([
        getCompanySettings(employee.tenantId),
        getEmployeeLeaveBalance(employee.tenantId, employee.id)
    ]);

    let data: PayslipData;
    switch (payslipType) {
      case 'Leave':
        data = payslipUtils.calculateLeaveSalaryPayslip(employee, inputs.leaveStart, inputs.leaveEnd);
        break;
      case 'Final Settlement':
        data = payslipUtils.calculateFinalSettlementPayslip(employee, inputs.lastDay, leaveBalance);
        break;
      case 'Monthly':
      default:
        data = payslipUtils.calculateMonthlyPayslip(employee);
    }
    
    data.companySettings = settings;
    setPayslipData(data);
    setLoading(false);
    setStep('preview');
  };
  
  const handleDownloadPDF = async () => {
    const element = payslipRef.current;
    if (!element || !employee) return;
    setLoading(true);
    const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff' });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payslip_${payslipType}_${employee.name.replace(/\s/g, '_')}.pdf`);
    setLoading(false);
  };

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;

    if (step === 'preview' && payslipData) {
      return <div ref={payslipRef}><Payslip data={payslipData} /></div>;
    }

    if (step === 'inputs') {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Enter Details for {payslipType} Payslip</h3>
          {payslipType === 'Leave' && (
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Leave Start Date</label>
                    <input type="date" value={inputs.leaveStart} onChange={e => setInputs({...inputs, leaveStart: e.target.value})} className="mt-1 block w-full bg-brand-secondary border border-slate-600 rounded-md shadow-sm p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Leave End Date</label>
                    <input type="date" value={inputs.leaveEnd} onChange={e => setInputs({...inputs, leaveEnd: e.target.value})} className="mt-1 block w-full bg-brand-secondary border border-slate-600 rounded-md shadow-sm p-2" />
                </div>
             </div>
          )}
           {payslipType === 'Final Settlement' && (
             <div>
                <label className="block text-sm font-medium">Last Working Day</label>
                <input type="date" value={inputs.lastDay} onChange={e => setInputs({...inputs, lastDay: e.target.value})} className="mt-1 block w-full bg-brand-secondary border border-slate-600 rounded-md shadow-sm p-2" />
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Select Payslip Type</h3>
        <p className="text-sm text-nav-icon">Choose the type of payslip you want to generate for {employee?.name}.</p>
        <div className="flex flex-col space-y-2">
            {(['Monthly', 'Leave', 'Final Settlement'] as PayslipType[]).map(type => (
                <label key={type} className={`p-3 border rounded-lg cursor-pointer ${payslipType === type ? 'bg-brand-primary-light border-accent' : 'bg-brand-secondary border-slate-600'}`}>
                    <input type="radio" name="payslipType" value={type} checked={payslipType === type} onChange={() => setPayslipType(type)} className="mr-2 accent-accent" />
                    {type}
                </label>
            ))}
        </div>
      </div>
    );
  };

  const getFooter = () => {
    if (step === 'preview') {
        return <>
            <Button variant="secondary" onClick={() => setStep(payslipType === 'Monthly' ? 'selectType' : 'inputs')}>Back</Button>
            <Button onClick={handleDownloadPDF} isLoading={loading} icon={<DownloadIcon />}>Download PDF</Button>
        </>
    }
    if (step === 'inputs') {
        return <>
            <Button variant="secondary" onClick={() => setStep('selectType')}>Back</Button>
            <Button onClick={handleGeneratePreview}>Generate Preview</Button>
        </>
    }
    // selectType step
    return <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => payslipType === 'Monthly' ? handleGeneratePreview() : setStep('inputs')}>Next</Button>
    </>
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Payslip" footer={getFooter()}>
      {renderContent()}
    </Modal>
  );
};

export default GeneratePayslipModal;