import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getAssetMaintenances } from '../../services/api';
import type { AssetMaintenance } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';

const AssetMaintenanceView: React.FC = () => {
    const { currentUser } = useAppContext();
    const { data: maintenances, loading } = useDataFetching(() => getAssetMaintenances(currentUser!.tenantId));

    const StatusBadge: React.FC<{ status: AssetMaintenance['status'] }> = ({ status }) => {
        const colors = {
            'Open': 'bg-red-100 text-red-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-green-100 text-green-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                 {(maintenances || []).length === 0 ? (
                    <EmptyState message="No Maintenance Records Found" description="All maintenance work orders will be displayed here." />
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Asset</th>
                                <th scope="col" className="px-6 py-3">Maintenance Type</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Cost</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(maintenances || []).map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{item.assetName}</td>
                                    <td className="px-6 py-4">{item.maintenanceType}</td>
                                    <td className="px-6 py-4 max-w-sm truncate">{item.description}</td>
                                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">QAR {item.cost.toLocaleString()}</td>
                                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AssetMaintenanceView;
