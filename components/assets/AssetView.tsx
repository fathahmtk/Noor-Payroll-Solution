import React, { useState } from 'react';
import { getAssets, addAsset as apiAddAsset, updateAsset as apiUpdateAsset, getEmployees } from '../../services/api';
import type { CompanyAsset, Employee } from '../../types';
import Button from '../common/Button.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import AssetTable from './AssetTable.tsx';
import AddAssetModal from './AddAssetModal.tsx';
import { useDataFetching } from '../../hooks/useDataFetching.tsx';
import Tabs from '../common/Tabs.tsx';
import AssetMaintenanceView from './AssetMaintenanceView.tsx';
import { useAppContext } from '../../AppContext.tsx';
import LoadingSpinner from '../common/LoadingSpinner.tsx';

type TabId = 'list' | 'maintenance';

const AssetView: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: assets, loading: loadingAssets, refresh: fetchAssets } = useDataFetching(
    currentUser ? `assets-${currentUser.tenantId}` : null,
    () => getAssets(currentUser!.tenantId)
  );
  const { data: employees, loading: loadingEmps } = useDataFetching(
    currentUser ? `employees-${currentUser.tenantId}` : null,
    () => getEmployees(currentUser!.tenantId)
  );
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CompanyAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('list');

  const tabs: { id: TabId, label: string }[] = [
    { id: 'list', label: 'Asset List' },
    { id: 'maintenance', label: 'Maintenance Work Orders' },
  ];
  
  const handleCloseModal = () => {
      setIsFormModalOpen(false);
      setSelectedAsset(null);
  };

  const handleOpenAddModal = () => {
      setSelectedAsset(null);
      setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (asset: CompanyAsset) => {
    setSelectedAsset(asset);
    setIsFormModalOpen(true);
  };

  const handleSubmitAsset = async (assetData: Omit<CompanyAsset, 'id' | 'tenantId'> | CompanyAsset) => {
      if (!currentUser?.tenantId) return;
      setIsSubmitting(true);
      if ('id' in assetData) {
          await apiUpdateAsset(currentUser.tenantId, assetData);
      } else {
          await apiAddAsset(currentUser.tenantId, assetData as Omit<CompanyAsset, 'id' | 'tenantId'>);
      }
      setIsSubmitting(false);
      handleCloseModal();
      await fetchAssets();
  };
  
  const loading = loadingAssets || loadingEmps;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Asset Management</h2>
        {activeTab === 'list' && (
            <Button onClick={handleOpenAddModal} icon={<PlusIcon />}>
              Add New Asset
            </Button>
        )}
      </div>

      <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-4">
        {loading ? (
          <LoadingSpinner />
        ) : activeTab === 'list' ? (
          <AssetTable 
            assets={assets || []} 
            employees={employees || []} 
            onEdit={handleOpenEditModal} 
            onAdd={handleOpenAddModal}
          />
        ) : (
          <AssetMaintenanceView assets={assets || []} />
        )}
      </div>
      
      <AddAssetModal 
        isOpen={isFormModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitAsset}
        employees={employees || []}
        isSubmitting={isSubmitting}
        assetToEdit={selectedAsset}
      />
    </div>
  );
};

export default AssetView;