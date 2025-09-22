import React, { useCallback, useEffect, useState } from 'react';
import DepartmentBalance from './DepartmentBalance';
import PettyCashTable from './PettyCashTable';
import { getPettyCashTransactions } from '../../services/api';
import type { PettyCashTransaction } from '../../types';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PettyCashView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        const data = await getPettyCashTransactions(currentUser.tenantId);
        setTransactions(data);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="p-6 space-y-6">
            <DepartmentBalance />
            {loading ? <LoadingSpinner /> : (
                <PettyCashTable transactions={transactions} onUpdate={fetchData} />
            )}
        </div>
    );
};

export default PettyCashView;
