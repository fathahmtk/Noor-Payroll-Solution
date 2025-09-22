import React, { useState, useEffect } from 'react';
import type { CompanyAsset, AssetMaintenance } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (maintenanceData: Omit<AssetMaintenance, 'id' | 'assetName' | 'tenantId'>) => void;
  assets: CompanyAsset[];
  isSubmitting: boolean;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

const getInitialState = (assets: CompanyAsset[]) => ({
    assetId: assets[0]?.id || '',
    maintenanceType: 'Repair' as AssetMaintenance['maintenanceType'],
    description: '',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Open' as AssetMaintenance['status'],
});

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ isOpen, onClose, onSubmit, assets, isSubmitting }) => {
  const [formData, setFormData] = useState(getInitialState(assets));

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState(assets));
    }
  }, [isOpen, assets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
        ...formData,
        cost: parseFloat(String(formData.cost)) || 0,
    };
    onSubmit(processedData);
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-maintenance-form" isLoading={isSubmitting}>
        Add Record
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Asset Maintenance Record" footer={modalFooter}>
      <form id="add-maintenance-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="assetId" className={formLabelClasses}>Asset</label>
            <select id="assetId" name="assetId" value={formData.assetId} onChange={handleChange} required className={formSelectClasses}>
                {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</option>
                ))}
            </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="maintenanceType" className={formLabelClasses}>Maintenance Type</label>
                <select id="maintenanceType" name="maintenanceType" value={formData.maintenanceType} onChange={handleChange} className={formSelectClasses}>
                    <option>Repair</option><option>Upgrade</option><option>Check-up</option>
                </select>
            </div>
             <div>
                <label htmlFor="date" className={formLabelClasses}>Date</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className={formInputClasses} />
            </div>
        </div>
        <div>
            <label htmlFor="description" className={formLabelClasses}>Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required className={formInputClasses}></textarea>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="cost" className={formLabelClasses}>Cost (QAR)</label>
                <input type="number" step="0.01" id="cost" name="cost" value={formData.cost} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label htmlFor="status" className={formLabelClasses}>Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className={formSelectClasses}>
                    <option>Open</option><option>In Progress</option><option>Completed</option>
                </select>
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddMaintenanceModal;