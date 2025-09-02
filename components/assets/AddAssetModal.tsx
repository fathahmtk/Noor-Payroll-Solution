import React, { useState, useEffect } from 'react';
import type { Employee, CompanyAsset } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (asset: Omit<CompanyAsset, 'id' | 'tenantId'> | CompanyAsset) => void;
  employees: Employee[];
  isSubmitting: boolean;
  assetToEdit?: CompanyAsset | null;
}

const getInitialState = (): Omit<CompanyAsset, 'id' | 'tenantId'> => ({
    assetTag: '',
    name: '',
    category: 'IT Equipment',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 0,
    residualValue: 0,
    depreciationMethod: 'Straight-line',
    usefulLifeMonths: 36,
    vendor: '',
    warrantyEndDate: '',
    location: 'Doha Office',
    status: 'Available',
    assignedToEmployeeId: undefined,
    assignmentDate: undefined,
});

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSubmit, employees, isSubmitting, assetToEdit }) => {
  const isEditMode = !!assetToEdit;
  const [formData, setFormData] = useState<Partial<CompanyAsset>>(isEditMode ? assetToEdit : getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(isEditMode ? assetToEdit : getInitialState());
    }
  }, [isOpen, assetToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (!value) {
        setFormData(prev => ({ ...prev, assignedToEmployeeId: undefined, assignmentDate: undefined, status: 'Available' }));
    } else {
        setFormData(prev => ({ ...prev, assignedToEmployeeId: value, assignmentDate: new Date().toISOString().split('T')[0], status: 'Assigned' }));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
        ...getInitialState(), 
        ...formData,
        purchaseCost: parseFloat(String(formData.purchaseCost)) || 0,
        residualValue: parseFloat(String(formData.residualValue)) || 0,
        usefulLifeMonths: parseInt(String(formData.usefulLifeMonths)) || 0,
    };

    if (isEditMode) {
        onSubmit({ ...assetToEdit, ...processedData } as CompanyAsset);
    } else {
        onSubmit(processedData as Omit<CompanyAsset, 'id' | 'tenantId'>);
    }
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-asset-form" isLoading={isSubmitting}>
        {isEditMode ? 'Save Changes' : 'Add Asset'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Asset Details" : "Add New Asset"} footer={modalFooter}>
      <form id="add-asset-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2 text-gray-600">Asset Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assetTag" className="block text-sm font-medium text-gray-700">Asset Tag</label>
                    <input type="text" id="assetTag" name="assetTag" value={formData.assetTag || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., QT-LAP-003"/>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Asset Name</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., MacBook Pro 14"/>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select id="category" name="category" value={formData.category || 'IT Equipment'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option>IT Equipment</option><option>Furniture</option><option>Vehicle</option><option>Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">Serial Number</label>
                    <input type="text" id="serialNumber" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
        </div>

        <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2 text-gray-600">Purchase & Warranty</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
                    <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <div>
                    <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
                    <input type="text" id="vendor" name="vendor" value={formData.vendor || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="purchaseCost" className="block text-sm font-medium text-gray-700">Purchase Cost (QAR)</label>
                    <input type="number" step="0.01" id="purchaseCost" name="purchaseCost" value={formData.purchaseCost ?? ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="warrantyEndDate" className="block text-sm font-medium text-gray-700">Warranty End Date</label>
                    <input type="date" id="warrantyEndDate" name="warrantyEndDate" value={formData.warrantyEndDate || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
        </div>

        <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2 text-gray-600">Depreciation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="depreciationMethod" className="block text-sm font-medium text-gray-700">Method</label>
                    <select id="depreciationMethod" name="depreciationMethod" value={formData.depreciationMethod || 'None'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option>Straight-line</option><option>None</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="usefulLifeMonths" className="block text-sm font-medium text-gray-700">Useful Life (Months)</label>
                    <input type="number" id="usefulLifeMonths" name="usefulLifeMonths" value={formData.usefulLifeMonths ?? ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <div>
                    <label htmlFor="residualValue" className="block text-sm font-medium text-gray-700">Residual Value (QAR)</label>
                    <input type="number" step="0.01" id="residualValue" name="residualValue" value={formData.residualValue ?? ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
        </div>
        
        <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2 text-gray-600">Assignment & Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assignedToEmployeeId" className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <select id="assignedToEmployeeId" name="assignedToEmployeeId" value={formData.assignedToEmployeeId || ''} onChange={handleAssignmentChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option value="">-- Unassigned --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" name="status" value={formData.status || 'Available'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option>Available</option><option>Assigned</option><option>In Repair</option><option>Retired</option>
                    </select>
                </div>
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddAssetModal;
