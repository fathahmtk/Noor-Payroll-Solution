import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees } from '../../services/api';
import type { Employee } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import { useAppContext } from '../../AppContext';

const GratuityCalculator: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [lastWorkingDay, setLastWorkingDay] = useState<string>(new Date().toISOString().split('T')[0]);
    const [calculation, setCalculation] = useState<{ years: number; gratuity: number; rate: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToasts();
    const { currentUser } = useAppContext();

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!currentUser?.tenantId) return;
            const empData = await getEmployees(currentUser.tenantId);
            setEmployees(empData);
            if (empData.length > 0) {
                setSelectedEmployeeId(empData[0].id);
            }
            setLoading(false);
        };
        fetchEmployees();
    }, [currentUser]);

    const selectedEmployee = useMemo(() => {
        return employees.find(e => e.id === selectedEmployeeId);
    }, [employees, selectedEmployeeId]);

    const handleCalculate = () => {
        if (!selectedEmployee) return;

        const joinDate = new Date(selectedEmployee.joinDate);
        const endDate = new Date(lastWorkingDay);
        
        if (endDate < joinDate) {
            addToast("Last working day cannot be before the joining date.", 'error');
            setCalculation(null);
            return;
        }

        const yearsOfService = (endDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        const gratuityRateWeeks = 3; 
        const dailyWage = selectedEmployee.basicSalary / 30;
        const weeklyWage = dailyWage * 7;
        const gratuityAmount = weeklyWage * gratuityRateWeeks * yearsOfService;

        setCalculation({
            years: yearsOfService,
            gratuity: gratuityAmount,
            rate: gratuityRateWeeks,
        });
    };

    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">End of Service Gratuity Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Employee</label>
                    <select
                        id="employee"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                        disabled={loading}
                    >
                        {loading ? <option>Loading...</option> : employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="last-day" className="block text-sm font-medium text-gray-700">Last Working Day</label>
                    <input
                        type="date"
                        id="last-day"
                        value={lastWorkingDay}
                        onChange={(e) => setLastWorkingDay(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <Button onClick={handleCalculate} disabled={!selectedEmployee}>Calculate Gratuity</Button>
            </div>

            {calculation && selectedEmployee && (
                <div className="mt-6 p-4 border-t border-gray-200">
                    <h4 className="font-bold text-xl text-center text-brand-dark">Calculation Result</h4>
                    <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">End of Service Gratuity for <span className="font-bold">{selectedEmployee.name}</span></p>
                        <p className="text-4xl font-bold text-accent my-2">QAR {calculation.gratuity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="mt-4 text-sm text-gray-500 space-y-2">
                        <p className="font-semibold text-gray-700 text-center mb-2">Calculation Breakdown:</p>
                        <div className="flex justify-between p-2 bg-white rounded"><span>Years of Service:</span> <span className="font-mono">{calculation.years.toFixed(2)} years</span></div>
                        <div className="flex justify-between p-2 bg-white rounded"><span>Basic Salary:</span> <span className="font-mono">QAR {selectedEmployee.basicSalary.toLocaleString()}</span></div>
                         <div className="flex justify-between p-2 bg-white rounded"><span>Gratuity Rate:</span> <span className="font-mono">{calculation.rate} weeks per year</span></div>
                        <div className="flex justify-between p-2 bg-white rounded font-bold text-brand-dark"><span>Calculation:</span> <span className="font-mono">({selectedEmployee.basicSalary} / 30) * 7 * {calculation.rate} * {calculation.years.toFixed(2)}</span></div>
                    </div>
                </div>
            )}
            <p className="text-xs text-center text-gray-400 mt-4">Disclaimer: This is an estimate based on the Qatar Labor Law. The final amount should be confirmed by your HR department.</p>
        </div>
    );
};

export default GratuityCalculator;
