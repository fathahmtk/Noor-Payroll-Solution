import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getAssetMaintenances } from '../../services/api';
import type { AssetMaintenance, CompanyAsset } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';

interface AssetMaintenanceViewProps {
    assets: CompanyAsset[];
}

const StatusBadge: React.FC<{ status: AssetMaintenance['status'] }> = ({ status }) => {
    const colors = {
        'Open': 'bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20',
        'In Progress': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/20',
        'Completed': 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
            {status}
        </span>
    );
};

const AssetMaintenanceView: React.FC<AssetMaintenanceViewProps> = ({ assets }) => {
    const { currentUser, openModal } = useAppContext();
    const { data: maintenances, loading, refresh: fetchMaintenances } = useDataFetching(currentUser ? `asset-maintenances-${currentUser.tenantId}` : null, () => getAssetMaintenances(currentUser!.tenantId));

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Maintenance Work Orders</h3>
              <Button onClick={() => openModal('addMaintenance', { assets, onUpdate: fetchMaintenances })} icon={<PlusIcon />}>
                Add Maintenance Record
              </Button>
            </div>
            <div className="overflow-x-auto">
                 {(maintenances || []).length === 0 ? (
                    <EmptyState message="No Maintenance Records Found" description="All maintenance work orders will be displayed here." />
                ) : (
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs uppercase bg-secondary">
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
                                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 font-semibold text-foreground">{item.assetName}</td>
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