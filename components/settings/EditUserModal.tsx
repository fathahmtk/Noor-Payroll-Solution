import React, { useState, useEffect, useCallback } from 'react';
import type { User, Role } from '../../types';
import { getRoles } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: Pick<User, 'id' | 'name' | 'role'>) => void;
  user: { user: User, onUpdate: () => void } | null;
  isSubmitting: boolean;
  tenantId: string | undefined;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onUpdate, user, isSubmitting, tenantId }) => {
  const [formData, setFormData] = useState<{ name: string; roleId: string }>({ name: '', roleId: '' });
  const [roles, setRoles] = useState<Role[]>([]);
  
  useEffect(() => {
    if (user) {
      setFormData({ name: user.user.name, roleId: user.user.role.id });
    }
    if (isOpen && tenantId) {
        const fetchRoles = async () => {
            const rolesData = await getRoles(tenantId);
            setRoles(rolesData);
        };
        fetchRoles();
    }
  }, [user, isOpen, tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const selectedRole = roles.find(r => r.id === formData.roleId);
    if (!selectedRole) return;
    
    onUpdate({
        id: user.user.id,
        name: formData.name,
        role: selectedRole,
    });
    user.onUpdate(); // Trigger refresh on the parent component
  };
  
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="edit-user-form" isLoading={isSubmitting}>Save Changes</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user?.user.name}`} footer={modalFooter}>
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Role</label>
            <select id="roleId" name="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                ))}
            </select>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;