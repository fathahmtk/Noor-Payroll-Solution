import React, { useState, useMemo } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getAuditLogs } from '../../services/api';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import type { AuditLog } from '../../types';

const AuditTrailView: React.FC = () => {
    const { currentUser } = useAppContext();
    const { data: logs, loading } = useDataFetching(
        currentUser ? `auditLogs-${currentUser.tenantId}` : null,
        () => getAuditLogs(currentUser!.tenantId)
    );
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        if (!searchTerm) return logs;

        return logs.filter(log => 
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Audit Trail</h3>
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        className="bg-secondary border border-border rounded-lg shadow-sm p-2 w-1/3 focus:ring-primary focus:border-primary text-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {filteredLogs.length === 0 ? (
                    <EmptyState 
                        message="No Audit Logs Found"
                        description={searchTerm ? "Try adjusting your search." : "System actions will be recorded here."}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs text-secondary-foreground uppercase bg-secondary font-medium">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Timestamp</th>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                    <th scope="col" className="px-6 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-semibold text-foreground">{log.userName}</td>
                                        <td className="px-6 py-4">{log.action}</td>
                                        <td className="px-6 py-4">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditTrailView;