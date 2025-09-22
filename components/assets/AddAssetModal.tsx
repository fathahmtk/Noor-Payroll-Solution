import React, { useState, useEffect } from 'react';
import type { Employee, CompanyAsset } from '../../types';
import Modal from '../common/Modal.tsx';
import Button from '../common/Button.tsx';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (asset: Omit<CompanyAsset, 'id' | 'tenantId'> | CompanyAsset) => void;
  employees: Employee[];
  isSubmitting: boolean;
  assetToEdit?: CompanyAsset | null;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

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
        <div className="p-4 border border-border rounded-md">
            <h4 className="font-semibold mb-2 text-muted-foreground">Asset Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assetTag" className={formLabelClasses}>Asset Tag</label>
                    <input type="text" id="assetTag" name="assetTag" value={formData.assetTag || ''} onChange={handleChange} required className={formInputClasses} placeholder="e.g., QT-LAP-003"/>
                </div>
                <div>
                    <label htmlFor="name" className={formLabelClasses}>Asset Name</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className={formInputClasses} placeholder="e.g., MacBook Pro 14"/>
                </div>
                <div>
                    <label htmlFor="category" className={formLabelClasses}>Category</label>
                    <select id="category" name="category" value={formData.category || 'IT Equipment'} onChange={handleChange} className={formSelectClasses}>
                        <option>IT Equipment</option><option>Furniture</option><option>Vehicle</option><option>Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="serialNumber" className={formLabelClasses}>Serial Number</label>
                    <input type="text" id="serialNumber" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} required className={formInputClasses} />
                </div>
            </div>
        </div>

        <div className="p-4 border border-border rounded-md">
            <h4 className="font-semibold mb-2 text-muted-foreground">Purchase & Warranty</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="purchaseDate" className={formLabelClasses}>Purchase Date</label>
                    <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} required className={formInputClasses} />
                </div>
                 <div>
                    <label htmlFor="vendor" className={formLabelClasses}>Vendor</label>
                    <input type="text" id="vendor" name="vendor" value={formData.vendor || ''} onChange={handleChange} className={formInputClasses} />
                </div>
                <div>
                    <label htmlFor="purchaseCost" className={formLabelClasses}>Purchase Cost (QAR)</label>
                    <input type="number" step="0.01" id="purchaseCost" name="purchaseCost" value={formData.purchaseCost ?? ''} onChange={handleChange} required className={formInputClasses} />
                </div>
                <div>
                    <label htmlFor="warrantyEndDate" className={formLabelClasses}>Warranty End Date</label>
                    <input type="date" id="warrantyEndDate" name="warrantyEndDate" value={formData.warrantyEndDate || ''} onChange={handleChange} className={formInputClasses} />
                </div>
            </div>
        </div>

        <div className="p-4 border border-border rounded-md">
            <h4 className="font-semibold mb-2 text-muted-foreground">Depreciation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="depreciationMethod" className={formLabelClasses}>Method</label>
                    <select id="depreciationMethod" name="depreciationMethod" value={formData.depreciationMethod || 'None'} onChange={handleChange} className={formSelectClasses}>
                        <option>Straight-line</option><option>None</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="usefulLifeMonths" className={formLabelClasses}>Useful Life (Months)</label>
                    <input type="number" id="usefulLifeMonths" name="usefulLifeMonths" value={formData.usefulLifeMonths ?? ''} onChange={handleChange} required className={formInputClasses} />
                </div>
                 <div>
                    <label htmlFor="residualValue" className={formLabelClasses}>Residual Value (QAR)</label>
                    <input type="number" step="0.01" id="residualValue" name="residualValue" value={formData.residualValue ?? ''} onChange={handleChange} required className={formInputClasses} />
                </div>
            </div>
        </div>
        
        <div className="p-4 border border-border rounded-md">
            <h4 className="font-semibold mb-2 text-muted-foreground">Assignment & Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assignedToEmployeeId" className={formLabelClasses}>Assigned To</label>
                    <select id="assignedToEmployeeId" name="assignedToEmployeeId" value={formData.assignedToEmployeeId || ''} onChange={handleAssignmentChange} className={formSelectClasses}>
                        <option value="">-- Unassigned --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className={formLabelClasses}>Status</label>
                    <select id="status" name="status" value={formData.status || 'Available'} onChange={handleChange} className={formSelectClasses}>
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