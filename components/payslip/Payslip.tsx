import React from 'react';
import type { PayslipData } from '../../types';

interface PayslipProps {
  data: PayslipData;
}

const Payslip: React.FC<PayslipProps> = ({ data }) => {
  const { employee, companySettings, period, payDate, earnings, deductions } = data;

  // FIX: Add explicit generic type <number> to reduce to ensure the result is typed as a number.
  const totalEarnings = Object.values(earnings).reduce<number>((sum, value) => sum + (Number(value) || 0), 0);
  const totalDeductions = Object.values(deductions).reduce<number>((sum, value) => sum + (Number(value) || 0), 0);
  const netPay = totalEarnings - totalDeductions;

  const formatCurrency = (amount: number) => `QAR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const earningItems = [
    { label: 'Basic Salary', value: earnings.basicSalary },
    { label: 'Allowances', value: earnings.allowances },
    ...(earnings.leaveEncashment ? [{ label: 'Leave Encashment', value: earnings.leaveEncashment }] : []),
    ...(earnings.gratuity ? [{ label: 'End of Service Gratuity', value: earnings.gratuity }] : []),
  ];

  const deductionItems = [
    { label: 'Standard Deductions', value: deductions.standardDeductions },
    ...(deductions.otherDeductions ? [{ label: 'Other Deductions', value: deductions.otherDeductions }] : []),
  ];

  return (
    <div className="p-6 bg-white text-black font-sans aspect-[1/1.414] w-full max-w-[800px] mx-auto border rounded-lg shadow-lg">
      <header className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">{companySettings.companyName}</h1>
          <p className="text-sm">Establishment ID: {companySettings.establishmentId}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase">{data.type} PAYSLIP</h2>
          <p className="text-sm">Pay Date: {new Date(payDate).toLocaleDateString()}</p>
        </div>
      </header>

      <section className="mb-4">
        <div className="border rounded-md p-3 text-sm">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="font-bold">Employee Name:</div><div>{employee.name}</div>
            <div className="font-bold">Position:</div><div>{employee.position}</div>
            <div className="font-bold">Qatar ID (QID):</div><div>{employee.qid}</div>
            <div className="font-bold">Pay Period:</div><div>{period}</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6 mb-4">
        <div className="border rounded-md p-3">
          <h3 className="font-bold border-b mb-2 pb-1 text-base">Earnings</h3>
          <div className="space-y-1 text-sm">
            {earningItems.map(item => (
              <div key={item.label} className="flex justify-between">
                <span>{item.label}</span>
                {/* FIX: Explicitly cast value to number to fix 'unknown' type error. */}
                <span>{formatCurrency(Number(item.value) || 0)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold border-t mt-2 pt-1 text-base">
            <span>Total Earnings</span>
            <span>{formatCurrency(totalEarnings)}</span>
          </div>
        </div>
        <div className="border rounded-md p-3">
          <h3 className="font-bold border-b mb-2 pb-1 text-base">Deductions</h3>
          <div className="space-y-1 text-sm">
             {deductionItems.map(item => (
              <div key={item.label} className="flex justify-between">
                <span>{item.label}</span>
                {/* FIX: Explicitly cast value to number to fix 'unknown' type error. */}
                <span>{formatCurrency(Number(item.value) || 0)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold border-t mt-2 pt-1 text-base">
            <span>Total Deductions</span>
            <span>{formatCurrency(totalDeductions)}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 bg-gray-100 rounded-md text-center">
        <p className="font-bold text-xl">NET PAY</p>
        <p className="font-bold text-3xl">{formatCurrency(netPay)}</p>
      </section>
      
      {data.calculationDetails && data.calculationDetails.length > 0 && (
          <section className="mt-4 p-3 text-xs text-gray-600 border rounded-md">
              <h4 className="font-bold mb-1">Notes:</h4>
              <ul className="list-disc list-inside">
                  {data.calculationDetails.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
          </section>
      )}
    </div>
  );
};

export default Payslip;
