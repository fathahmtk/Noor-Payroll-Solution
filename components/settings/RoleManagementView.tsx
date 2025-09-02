import React, { useCallback, useEffect, useState } from 'react';
import { getRoles } from '../../services/api';
import type { Role } from '../../types';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import PencilIcon from '../icons/PencilIcon';

const RoleManagementView: React.FC = () => {
    const { openModal, currentUser } = useAppContext();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        if (!currentUser?.tenantId) return;
        setLoading(true);
        const rolesData = await getRoles(currentUser.tenantId);
        setRoles(rolesData);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);
    
    const handleUpdate = () => {
        fetchRoles();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-brand-dark">Roles & Permissions</h3>
                <Button onClick={() => openModal('createRole', { onUpdate: handleUpdate })} icon={<PlusIcon />}>
                    Create Role
                </Button>
            </div>
            {roles.length === 0 ? (
                <EmptyState message="No Roles Found" description="Create roles to manage user permissions." />
            ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Role Name</th>
                                <th scope="col" className="px-6 py-3">Permissions Count</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{role.name}</td>
                                    <td className="px-6 py-4">{role.permissions.length}</td>
                                    <td className="px-6 py-4 text-center">
                                         <Button variant="secondary" size="sm" icon={<PencilIcon className="w-4 h-4" />} onClick={() => openModal('editRole', { role, onUpdate: handleUpdate })}>
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RoleManagementView;