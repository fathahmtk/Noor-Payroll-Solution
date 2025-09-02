import React, { useState } from 'react';
import { getAssets, addAsset as apiAddAsset, updateAsset as apiUpdateAsset, getEmployees } from '../../services/api';
import type { CompanyAsset } from '../../types';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import AssetTable from './AssetTable';
import AddAssetModal from './AddAssetModal';
import { useDataFetching } from '../../hooks/useDataFetching';
import Tabs from '../common/Tabs';
import AssetMaintenanceView from './AssetMaintenanceView';
import { useAppContext } from '../../AppContext';

type TabId = 'list' | 'maintenance';

const AssetView: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: assets, loading: loadingAssets, refresh: fetchAssets } = useDataFetching(() => getAssets(currentUser!.tenantId));
  const { data: employees, loading: loadingEmps } = useDataFetching(() => getEmployees(currentUser!.tenantId));
  
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
        <h2 className="text-xl font-semibold text-brand-dark">Asset Management</h2>
        {activeTab === 'list' && (
            <Button onClick={handleOpenAddModal} icon={<PlusIcon />}>
              Add New Asset
            </Button>
        )}
      </div>

      <Tabs<TabId> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center h-64"><p>Loading assets...</p></div>
        ) : activeTab === 'list' ? (
          <AssetTable assets={assets || []} onEdit={handleOpenEditModal} />
        ) : (
          <AssetMaintenanceView />
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
