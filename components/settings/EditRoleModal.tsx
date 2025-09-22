import React, { useState, useEffect, useMemo } from 'react';
import type { Role, Permission } from '../../types';
import { getPermissions } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: Role | Omit<Role, 'id'>) => void;
  role: { role?: Role, onUpdate: () => void } | null;
  isSubmitting: boolean;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, onClose, onSubmit, role, isSubmitting }) => {
  const isEditMode = !!role?.role;
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoadingPermissions(true);
      getPermissions().then(data => {
        setAllPermissions(data);
        setLoadingPermissions(false);
      });
      if (isEditMode && role?.role) {
        setName(role.role.name);
        setSelectedPermissions(role.role.permissions);
      } else {
        setName('');
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, role, isEditMode]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
        prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleData = {
        name,
        permissions: selectedPermissions,
    };
    if (isEditMode && role?.role) {
        onSubmit({ id: role.role.id, ...roleData });
    } else {
        onSubmit(roleData);
    }
  };

  const permissionGroups = useMemo(() => {
    return allPermissions.reduce((acc, permission) => {
        (acc[permission.group] = acc[permission.group] || []).push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);
  }, [allPermissions]);
  
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="edit-role-form" isLoading={isSubmitting}>
        {isEditMode ? 'Save Changes' : 'Create Role'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? `Edit Role: ${role?.role?.name}` : "Create New Role"} footer={modalFooter}>
      <form id="edit-role-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="name" className={formLabelClasses}>Role Name</label>
            <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required className={formInputClasses} />
        </div>
        <div>
            <label className={formLabelClasses}>Permissions</label>
            {loadingPermissions ? <LoadingSpinner /> : (
                <div className="mt-2 space-y-4 max-h-64 overflow-y-auto pr-2 border border-border rounded-md p-3">
                    {/* FIX: Explicitly cast the result of Object.entries to fix 'map does not exist on type unknown' error. */}
                    {(Object.entries(permissionGroups) as [string, Permission[]][]).map(([group, permissions]) => (
                        <div key={group}>
                            <h4 className="font-semibold text-xs uppercase text-muted-foreground">{group}</h4>
                            <div className="mt-1 space-y-1">
                                {permissions.map(p => (
                                    <label key={p.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(p.id)}
                                            onChange={() => handlePermissionToggle(p.id)}
                                            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                                        />
                                        <span className="ml-2 text-sm text-muted-foreground">{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </form>
    </Modal>
  );
};

export default EditRoleModal;
