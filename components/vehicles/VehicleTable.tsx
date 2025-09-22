import React, { useCallback, useEffect, useState } from 'react';
import { getVehicles, getEmployees } from '../../services/api';
import type { CompanyVehicle, Employee } from '../../types';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PencilIcon from '../icons/PencilIcon';

const getStatus = (expiryDate: string): { text: string; color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiry < today) {
        return { text: 'Expired', color: 'bg-red-500/10 text-red-400' };
    }
    if (expiry <= thirtyDaysFromNow) {
        return { text: 'Expires Soon', color: 'bg-yellow-500/10 text-yellow-400' };
    }
    return { text: 'Valid', color: 'bg-green-500/10 text-green-400' };
};


const VehicleTable: React.FC = () => {
    const { currentUser, openModal } = useAppContext();
    const [vehicles, setVehicles] = useState<CompanyVehicle[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        const [vehicleData, employeeData] = await Promise.all([
            getVehicles(currentUser.tenantId),
            getEmployees(currentUser.tenantId)
        ]);
        setVehicles(vehicleData);
        setEmployees(employeeData);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getEmployeeName = (id?: string) => {
        if (!id) return <span className="text-muted-foreground italic">Unassigned</span>;
        return employees.find(e => e.id === id)?.name || 'Unknown Employee';
    };

    const handleEdit = (vehicle: CompanyVehicle) => {
        openModal('addVehicle', { vehicle, onUpdate: fetchData });
    }

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            {vehicles.length === 0 ? (
                <EmptyState 
                    message="No Vehicles Found"
                    description="Get started by adding a company vehicle."
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Vehicle</th>
                                <th scope="col" className="px-6 py-3">Plate No.</th>
                                <th scope="col" className="px-6 py-3">Assigned To</th>
                                <th scope="col" className="px-6 py-3">Registration (Istimara)</th>
                                <th scope="col" className="px-6 py-3">Insurance</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 font-semibold text-foreground">{v.make} {v.model} ({v.year})</td>
                                    <td className="px-6 py-4 font-mono">{v.plateNumber}</td>
                                    <td className="px-6 py-4">{getEmployeeName(v.assignedToEmployeeId)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatus(v.registrationExpiry).color}`}>
                                            {new Date(v.registrationExpiry).toLocaleDateString()}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatus(v.insuranceExpiry).color}`}>
                                            {new Date(v.insuranceExpiry).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button size="sm" variant="secondary" icon={<PencilIcon />} onClick={() => handleEdit(v)}>Edit</Button>
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

export default VehicleTable;