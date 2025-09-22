import React, { useState, useEffect, useCallback } from 'react';
import { getCompanySettings, updateCompanySettings } from '../../services/api';
import type { CompanySettings } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAppContext } from '../../AppContext';
import { useDataFetching } from '../../hooks/useDataFetching';

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";

const CompanySettingsForm: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToasts();
  const { currentUser } = useAppContext();

  const { data: settingsData, loading: isLoading, setData: setSettings } = useDataFetching(
    currentUser ? `settings-${currentUser.tenantId}` : null,
    () => getCompanySettings(currentUser!.tenantId)
  );

  const settings = settingsData as CompanySettings | null;

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
    <div className="bg-card p-8 rounded-lg shadow-md border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="companyName" className={formLabelClasses}>Company Name</label>
                <input type="text" id="companyName" name="companyName" value={settings.companyName} onChange={handleChange} className={formInputClasses} />
            </div>
             <div>
                <label htmlFor="establishmentId" className={formLabelClasses}>Establishment ID</label>
                <input type="text" id="establishmentId" name="establishmentId" value={settings.establishmentId} onChange={handleChange} className={formInputClasses} />
            </div>
             <div>
                <label htmlFor="bankName" className={formLabelClasses}>Company Bank Name</label>
                <input type="text" id="bankName" name="bankName" value={settings.bankName} onChange={handleChange} className={formInputClasses} />
            </div>
             <div>
                <label htmlFor="corporateAccountNumber" className={formLabelClasses}>Corporate Account Number (IBAN)</label>
                <input type="text" id="corporateAccountNumber" name="corporateAccountNumber" value={settings.corporateAccountNumber} onChange={handleChange} className={formInputClasses} />
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