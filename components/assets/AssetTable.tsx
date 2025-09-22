import React, { useMemo, useState } from 'react';
import type { CompanyAsset, Employee } from '../../types';
import Button from '../common/Button.tsx';
import EmptyState from '../common/EmptyState.tsx';
import AssetIcon from '../icons/AssetIcon.tsx';

interface AssetTableProps {
  assets: (CompanyAsset & { assignedToEmployeeName?: string })[];
  employees: Employee[];
  onEdit: (asset: CompanyAsset) => void;
  onAdd: () => void;
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

const formSelectClasses = "border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary text-sm";


const AssetTable: React.FC<AssetTableProps> = ({ assets, employees, onEdit, onAdd }) => {
  const [filters, setFilters] = useState({ status: 'all', category: 'all', employeeId: 'all' });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredAssets = useMemo(() => {
      return assets.filter(asset => {
          const statusMatch = filters.status === 'all' || asset.status === filters.status;
          const categoryMatch = filters.category === 'all' || asset.category === filters.category;
          const employeeMatch = filters.employeeId === 'all' || asset.assignedToEmployeeId === filters.employeeId;
          return statusMatch && categoryMatch && employeeMatch;
      });
  }, [assets, filters]);

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
       <div className="flex justify-end items-center space-x-2 mb-4">
          <select name="status" value={filters.status} onChange={handleFilterChange} className={formSelectClasses}>
            <option value="all">All Statuses</option>
            <option>Available</option><option>Assigned</option><option>In Repair</option><option>Retired</option>
          </select>
          <select name="category" value={filters.category} onChange={handleFilterChange} className={formSelectClasses}>
            <option value="all">All Categories</option>
            <option>IT Equipment</option><option>Furniture</option><option>Vehicle</option><option>Other</option>
          </select>
           <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange} className={formSelectClasses}>
            <option value="all">All Employees</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
      </div>

      {filteredAssets.length === 0 ? (
        <EmptyState 
            icon={<AssetIcon className="w-12 h-12" />}
            message={assets.length === 0 ? "No Assets Found" : "No Assets Match Your Filters"}
            description={assets.length === 0 ? "Get started by adding a company asset like a laptop or a vehicle." : "Try adjusting your filters."}
            action={assets.length === 0 ? { label: "Add New Asset", onClick: onAdd } : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-secondary text-secondary-foreground">
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
                {filteredAssets.map((asset) => {
                    const currentValue = calculateCurrentValue(asset);
                    
                    const statusColors = {
                        'Available': 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20',
                        'Assigned': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20',
                        'In Repair': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/20',
                        'Retired': 'bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20',
                    };
                    const statusColor = statusColors[asset.status] || 'bg-slate-500/10 text-slate-700 dark:text-slate-400 dark:bg-slate-500/20';

                    return (
                        <tr key={asset.id} className="border-b border-border hover:bg-muted/50">
                            <td className="px-6 py-4 font-medium text-foreground">
                                <div>{asset.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">{asset.assetTag}</div>
                            </td>
                            <td className="px-6 py-4">
                                {asset.assignedToEmployeeName ? (
                                    <div>{asset.assignedToEmployeeName}</div>
                                ) : (
                                    <span className="text-muted-foreground italic">Unassigned</span>
                                )}
                            </td>
                            <td className="px-6 py-4">{asset.location}</td>
                            <td className="px-6 py-4">{new Date(asset.warrantyEndDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-semibold text-foreground">QAR {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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