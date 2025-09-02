import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getAssetsByEmployeeId } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';

interface EmployeeAssignedAssetsTabProps {
  employeeId: string;
}

const EmployeeAssignedAssetsTab: React.FC<EmployeeAssignedAssetsTabProps> = ({ employeeId }) => {
  const { currentUser } = useAppContext();
  const { data: assets, loading } = useDataFetching(() => getAssetsByEmployeeId(currentUser!.tenantId, employeeId));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-brand-dark mb-4">Assigned Assets</h3>
      {assets && assets.length > 0 ? (
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Asset Name</th>
                        <th scope="col" className="px-6 py-3">Asset Tag</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Assignment Date</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map(asset => (
                        <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{asset.name}</td>
                            <td className="px-6 py-4 font-mono">{asset.assetTag}</td>
                            <td className="px-6 py-4">{asset.category}</td>
                            <td className="px-6 py-4">{asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <EmptyState message="No Assets Assigned" description="Company assets assigned to this employee will be listed here." />
      )}
    </div>
  );
};

export default EmployeeAssignedAssetsTab;