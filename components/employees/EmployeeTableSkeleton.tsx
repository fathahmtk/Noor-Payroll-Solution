import React from 'react';
import SkeletonLoader from '../common/SkeletonLoader';

const SkeletonRow: React.FC = () => (
    <tr className="border-b border-border">
        <td className="px-6 py-4">
            <div className="flex items-center">
                <SkeletonLoader className="w-10 h-10 rounded-full" />
                <div className="pl-3 flex-1 space-y-2">
                    <SkeletonLoader className="h-4 w-3/4" />
                    <SkeletonLoader className="h-3 w-1/2" />
                </div>
            </div>
        </td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-16" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-20" /></td>
        <td className="px-6 py-4"><SkeletonLoader className="h-4 w-28" /></td>
        <td className="px-6 py-4 text-center"><SkeletonLoader className="h-8 w-32 mx-auto rounded-md" /></td>
    </tr>
);

const EmployeeTableSkeleton: React.FC = () => {
    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4">
                <SkeletonLoader className="h-6 w-48" />
                <SkeletonLoader className="h-10 w-1/3 rounded-lg" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-muted-foreground">
                    <thead className="text-xs uppercase bg-secondary font-medium">
                        <tr>
                            <th scope="col" className="px-6 py-3">Employee</th>
                            <th scope="col" className="px-6 py-3">Position</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Total Salary</th>
                            <th scope="col" className="px-6 py-3">QID</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTableSkeleton;