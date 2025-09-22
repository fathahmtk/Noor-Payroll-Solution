import React, { useState, useEffect } from 'react';
import { Role, type InviteUser } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getRoles } from '../../services/api';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (newUser: InviteUser) => void;
  isSubmitting: boolean;
  tenantId: string | undefined;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInvite, isSubmitting, tenantId }) => {
  const [formData, setFormData] = useState<InviteUser>({
    name: '',
    username: '',
    roleId: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (isOpen && tenantId) {
        getRoles(tenantId).then(fetchedRoles => {
            setRoles(fetchedRoles);
            if (fetchedRoles.length > 0 && !formData.roleId) {
                setFormData(prev => ({ ...prev, roleId: fetchedRoles.find(r => r.name === 'Employee')?.id || fetchedRoles[0].id }));
            }
        });
    }
  }, [isOpen, tenantId, formData.roleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(formData);
  };
  
  const handleClose = () => {
    setFormData({ name: '', username: '', roleId: '' });
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="invite-user-form" isLoading={isSubmitting}>Send Invite</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite New User" footer={modalFooter}>
      <form id="invite-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label htmlFor="name" className={formLabelClasses}>Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label htmlFor="username" className={formLabelClasses}>Username (Email)</label>
                <input type="email" id="username" name="username" value={formData.username} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label htmlFor="roleId" className={formLabelClasses}>Role</label>
                <select id="roleId" name="roleId" value={formData.roleId} onChange={handleChange} className={formSelectClasses}>
                {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                ))}
                </select>
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default InviteUserModal;