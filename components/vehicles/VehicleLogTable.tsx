import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { getVehicleLogs, getVehicles } from '../../services/api';
import type { VehicleLog, CompanyVehicle } from '../../types';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';

const VehicleLogTable: React.FC = () => {
    const { currentUser, openModal } = useAppContext();
    const [logs, setLogs] = useState<VehicleLog[]>([]);
    const [vehicles, setVehicles] = useState<CompanyVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterVehicleId, setFilterVehicleId] = useState('all');

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        const [logData, vehicleData] = await Promise.all([
            getVehicleLogs(currentUser.tenantId),
            getVehicles(currentUser.tenantId)
        ]);
        setLogs(logData);
        setVehicles(vehicleData);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredLogs = useMemo(() => {
        if (filterVehicleId === 'all') return logs;
        return logs.filter(log => log.vehicleId === filterVehicleId);
    }, [logs, filterVehicleId]);

    const handleAddLog = () => {
        openModal('addVehicleLog', { vehicles, onUpdate: fetchData });
    }

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
             <div className="flex justify-between items-center mb-4">
                <select 
                    value={filterVehicleId} 
                    onChange={e => setFilterVehicleId(e.target.value)} 
                    className="border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground text-sm"
                >
                    <option value="all">All Vehicles</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plateNumber})</option>)}
                </select>
                <Button size="sm" icon={<PlusIcon />} onClick={handleAddLog}>
                    Add Log Entry
                </Button>
            </div>

            {filteredLogs.length === 0 ? (
                <EmptyState 
                    message="No Trip Logs Found"
                    description="Get started by adding a new trip log."
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Vehicle</th>
                                <th scope="col" className="px-6 py-3">Driver</th>
                                <th scope="col" className="px-6 py-3">Mileage (Start/End)</th>
                                <th scope="col" className="px-6 py-3">Purpose</th>
                                <th scope="col" className="px-6 py-3">Fuel Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 font-semibold text-foreground">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{log.vehicleName}</td>
                                    <td className="px-6 py-4">{log.employeeName}</td>
                                    <td className="px-6 py-4">{log.startMileage} / {log.endMileage}</td>
                                    <td className="px-6 py-4">{log.purpose}</td>
                                    <td className="px-6 py-4">QAR {log.fuelCost?.toFixed(2) || '0.00'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VehicleLogTable;