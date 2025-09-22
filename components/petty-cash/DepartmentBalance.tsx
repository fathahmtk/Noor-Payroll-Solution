import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getDepartmentBalances } from '../../services/api';
import type { Employee } from '../../types';
import { useAppContext } from '../../AppContext';
import SkeletonLoader from '../common/SkeletonLoader';

const StatCard: React.FC<{ department: string, balance: number }> = ({ department, balance }) => (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <p className="text-sm text-muted-foreground font-medium">{department}</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            QAR {balance.toLocaleString()}
        </p>
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-2">
        <SkeletonLoader className="h-4 w-2/3" />
        <SkeletonLoader className="h-8 w-1/2" />
    </div>
);

const DepartmentBalance: React.FC = () => {
    const { currentUser } = useAppContext();
    const { data: balances, loading } = useDataFetching(
        currentUser ? `departmentBalances-${currentUser.tenantId}` : null,
        () => getDepartmentBalances(currentUser!.tenantId)
    );
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Department Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    Object.entries(balances || {}).map(([dept, bal]) => (
                        <StatCard key={dept} department={dept} balance={bal as number} />
                    ))
                )}
            </div>
        </div>
    );
};

export default DepartmentBalance;