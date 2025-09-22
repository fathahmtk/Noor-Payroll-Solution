import React, { useState } from 'react';
import { getPayrollRuns } from '../../services/api.ts';
import type { PayrollRun } from '../../types.ts';
import Button from '../common/Button.tsx';
import DownloadIcon from '../icons/DownloadIcon.tsx';
import PayrollDetailsModal from './PayrollDetailsModal.tsx';
import { useDataFetching } from '../../hooks/useDataFetching.ts';
import LoadingSpinner from '../common/LoadingSpinner.tsx';
import { useAppContext } from '../../AppContext.tsx';

const downloadWPSFile = (content: string, month: string, year: number) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `WPS_${month.toUpperCase()}_${year}.sif`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const PayrollView: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: payrollRuns, loading: loadingRuns } = useDataFetching(
    currentUser ? `payrollRuns-${currentUser.tenantId}` : null,
    () => getPayrollRuns(currentUser!.tenantId)
  );
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);

  const handleViewDetails = (run: PayrollRun) => {
    setSelectedRun(run);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="bg-blue-500/10 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 rounded-r-lg" role="alert">
        <div className="flex">
            <div>
                <svg className="fill-current h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            </div>
            <div>
                <p className="font-bold">Wage Protection System (WPS)</p>
                <p className="text-sm">This page manages your monthly payroll runs. After processing, you can download the compliant Salary Information File (SIF) for submission to your bank.</p>
            </div>
        </div>
      </div>
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        {loadingRuns ? (
            <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-secondary text-secondary-foreground font-medium">
                <tr>
                  <th scope="col" className="px-6 py-3">Period</th>
                  <th scope="col" className="px-6 py-3">Run Date</th>
                  <th scope="col" className="px-6 py-3">Employee Count</th>
                  <th scope="col" className="px-6 py-3">Net Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(payrollRuns || []).map((run) => (
                  <tr key={run.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 font-semibold text-foreground">{run.month} {run.year}</td>
                    <td className="px-6 py-4">{new Date(run.runDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{run.employeeCount}</td>
                    <td className="px-6 py-4 font-bold text-foreground">QAR {run.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleViewDetails(run)}>View Details</Button>
                            {run.wpsFileContent && (
                                <Button size="sm" variant="secondary" icon={<DownloadIcon className="w-4 h-4"/>} onClick={() => downloadWPSFile(run.wpsFileContent!, run.month, run.year)}>
                                    Download SIF
                                </Button>
                            )}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PayrollDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        payrollRun={selectedRun}
      />
    </div>
  );
};

export default PayrollView;