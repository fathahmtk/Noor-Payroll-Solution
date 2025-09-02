import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getUsers } from '../../services/api';
import type { User } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import { useAppContext } from '../../AppContext';
import PencilIcon from '../icons/PencilIcon';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { openModal, currentUser } = useAppContext();

    const fetchUsers = useCallback(async () => {
        if (!currentUser?.tenantId) return;
        setLoading(true);
        const userData = await getUsers(currentUser.tenantId);
        setUsers(userData);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdate = () => {
      // After a user is updated or invited, refresh the list
      fetchUsers();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-brand-dark">User Accounts</h3>
              <Button onClick={() => openModal('inviteUser', { onUpdate: handleUpdate })} icon={<PlusIcon />}>
                Invite User
              </Button>
            </div>
            {users.length === 0 ? (
                <EmptyState message="No Users Found" description="System user accounts will be displayed here." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Full Name</th>
                                <th scope="col" className="px-6 py-3">Username (Email)</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 font-mono">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {user.role.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <Button variant="secondary" size="sm" icon={<PencilIcon className="w-4 h-4" />} onClick={() => openModal('editUser', { user, onUpdate: handleUpdate })}>
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

export default UserManagement;