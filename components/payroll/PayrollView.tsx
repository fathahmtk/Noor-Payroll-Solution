import React, { useState } from 'react';
import { getPayrollRuns } from '../../services/api';
import type { PayrollRun } from '../../types';
import Button from '../common/Button';
import DownloadIcon from '../icons/DownloadIcon';
import PayrollDetailsModal from './PayrollDetailsModal';
import { useDataFetching } from '../../hooks/useDataFetching';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAppContext } from '../../AppContext';

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
  const { data: payrollRuns, loading: loadingRuns } = useDataFetching(() => getPayrollRuns(currentUser!.tenantId));
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);

  const handleViewDetails = (run: PayrollRun) => {
    setSelectedRun(run);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="bg-brand-light p-6 rounded-xl shadow-sm border border-slate-200">
        {loadingRuns ? (
            <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-slate-500 uppercase bg-gray-soft font-medium">
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
                  <tr key={run.id} className="bg-white border-b hover:bg-gray-soft">
                    <td className="px-6 py-4 font-semibold text-gray-900">{run.month} {run.year}</td>
                    <td className="px-6 py-4">{new Date(run.runDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{run.employeeCount}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">QAR {run.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        run.status === 'Completed' ? 'bg-slate-100 text-slate-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
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
