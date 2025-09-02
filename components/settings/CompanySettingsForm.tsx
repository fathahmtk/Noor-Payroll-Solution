import React, { useState, useEffect, useCallback } from 'react';
import { getCompanySettings, updateCompanySettings } from '../../services/api';
import type { CompanySettings } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAppContext } from '../../AppContext';

const CompanySettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToasts();
  const { currentUser } = useAppContext();

  const fetchSettings = useCallback(async () => {
    if (!currentUser?.tenantId) return;
    setIsLoading(true);
    const data = await getCompanySettings(currentUser.tenantId);
    setSettings(data);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (settings) {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings && currentUser?.tenantId) {
      setIsSaving(true);
      try {
        await updateCompanySettings(currentUser.tenantId, settings);
        addToast('Company settings saved successfully!', 'success');
      } catch (error) {
        addToast('Failed to save settings.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!settings) {
    return <div>Could not load settings.</div>;
  }

  return (
    <div className="bg-brand-light p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" id="companyName" name="companyName" value={settings.companyName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
             <div>
                <label htmlFor="establishmentId" className="block text-sm font-medium text-gray-700">Establishment ID</label>
                <input type="text" id="establishmentId" name="establishmentId" value={settings.establishmentId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
             <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Company Bank Name</label>
                <input type="text" id="bankName" name="bankName" value={settings.bankName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
             <div>
                <label htmlFor="corporateAccountNumber" className="block text-sm font-medium text-gray-700">Corporate Account Number (IBAN)</label>
                <input type="text" id="corporateAccountNumber" name="corporateAccountNumber" value={settings.corporateAccountNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isSaving}>
                    Save Changes
                </Button>
            </div>
        </form>
    </div>
  );
};

export default CompanySettingsForm;
