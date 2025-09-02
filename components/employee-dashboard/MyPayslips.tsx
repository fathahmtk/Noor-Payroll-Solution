import React, { useState } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getEmployeePayslips, getEmployeeById, getPayrollRuns, getCompanySettings } from '../../services/api';
import type { Payslip } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import DownloadIcon from '../icons/DownloadIcon';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import { useAppContext } from '../../AppContext';

interface MyPayslipsProps {
  employeeId: string;
}

const MyPayslips: React.FC<MyPayslipsProps> = ({ employeeId }) => {
  const { currentUser, openModal } = useAppContext();
  const { data: payslips, loading } = useDataFetching(() => getEmployeePayslips(currentUser!.tenantId, employeeId));
  const { addToast } = useToasts();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (payslip: Payslip) => {
    if (!currentUser) return;
    setDownloadingId(payslip.id);
    try {
        const [employee, allPayrollRuns, settings] = await Promise.all([
            getEmployeeById(currentUser.tenantId, employeeId),
            getPayrollRuns(currentUser.tenantId),
            getCompanySettings(currentUser.tenantId)
        ]);
        
        const [month, yearStr] = payslip.period.split(' ');
        const year = parseInt(yearStr, 10);
        const payrollRun = allPayrollRuns?.find(pr => pr.month === month && pr.year === year);
        
        if (employee && payrollRun && settings) {
            openModal('viewPayslip', { employee, payrollRun, companySettings: settings });
        } else {
            addToast('Could not find detailed payslip information.', 'error');
        }
    } catch (e) {
        addToast('An error occurred while preparing the payslip.', 'error');
        console.error(e);
    } finally {
        setDownloadingId(null);
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-brand-light p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-brand-dark mb-4">My Payslips</h3>
      {(payslips || []).length > 0 ? (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Pay Period</th>
                        <th scope="col" className="px-6 py-3">Gross Salary</th>
                        <th scope="col" className="px-6 py-3">Net Salary</th>
                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(payslips || []).map(payslip => (
                        <tr key={payslip.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{payslip.period}</td>
                            <td className="px-6 py-4">QAR {payslip.grossSalary.toLocaleString()}</td>
                            <td className="px-6 py-4 font-bold">QAR {payslip.netSalary.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    icon={<DownloadIcon />} 
                                    onClick={() => handleDownload(payslip)}
                                    isLoading={downloadingId === payslip.id}
                                >
                                    View
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <EmptyState message="No Payslips Found" description="Your payslips will appear here after each payroll run." />
      )}
    </div>
  );
};

export default MyPayslips;
