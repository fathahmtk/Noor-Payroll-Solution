import React from 'react';
import type { CompanyAsset } from '../../types';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

interface AssetTableProps {
  assets: (CompanyAsset & { assignedToEmployeeName?: string })[];
  onEdit: (asset: CompanyAsset) => void;
}

const calculateCurrentValue = (asset: CompanyAsset): number => {
    if (asset.depreciationMethod === 'None' || asset.usefulLifeMonths <= 0) {
        return asset.purchaseCost;
    }

    const purchaseDate = new Date(asset.purchaseDate);
    const monthsOwned = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    if (monthsOwned >= asset.usefulLifeMonths) {
        return asset.residualValue;
    }

    const depreciableValue = asset.purchaseCost - asset.residualValue;
    const monthlyDepreciation = depreciableValue / asset.usefulLifeMonths;
    const totalDepreciation = monthlyDepreciation * monthsOwned;
    
    return Math.max(asset.residualValue, asset.purchaseCost - totalDepreciation);
};

const AssetTable: React.FC<AssetTableProps> = ({ assets, onEdit }) => {
  return (
    <div className="bg-brand-light p-6 rounded-lg shadow-md">
      {assets.length === 0 ? (
        <EmptyState 
            message="No Assets Found"
            description="Get started by adding a company asset like a laptop or a vehicle."
        />
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3">Asset</th>
                <th scope="col" className="px-6 py-3">Assigned To</th>
                <th scope="col" className="px-6 py-3">Location</th>
                <th scope="col" className="px-6 py-3">Warranty End</th>
                <th scope="col" className="px-6 py-3">Current Value</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {assets.map((asset) => {
                    const currentValue = calculateCurrentValue(asset);
                    
                    const statusColors = {
                        'Available': 'bg-green-100 text-green-800',
                        'Assigned': 'bg-blue-100 text-blue-800',
                        'In Repair': 'bg-yellow-100 text-yellow-800',
                        'Retired': 'bg-red-100 text-red-800',
                    };
                    const statusColor = statusColors[asset.status] || 'bg-gray-100 text-gray-800';

                    return (
                        <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <div>{asset.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{asset.assetTag}</div>
                            </td>
                            <td className="px-6 py-4">
                                {asset.assignedToEmployeeName ? (
                                    <div>{asset.assignedToEmployeeName}</div>
                                ) : (
                                    <span className="text-gray-400 italic">Unassigned</span>
                                )}
                            </td>
                            <td className="px-6 py-4">{asset.location}</td>
                            <td className="px-6 py-4">{new Date(asset.warrantyEndDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-semibold">QAR {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                                    {asset.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Button size="sm" variant="secondary" onClick={() => onEdit(asset)}>View/Edit</Button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default AssetTable;
