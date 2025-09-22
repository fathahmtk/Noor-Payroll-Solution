import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees } from '../../services/api';
import type { Employee } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import { useAppContext } from '../../AppContext';
import { calculateGratuity } from '../../utils/payslipUtils';

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

const GratuityCalculator: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [lastWorkingDay, setLastWorkingDay] = useState<string>(new Date().toISOString().split('T')[0]);
    const [calculation, setCalculation] = useState<{ years: number; gratuity: number } | null>(null);
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

        const { yearsOfService, gratuityAmount } = calculateGratuity(selectedEmployee, lastWorkingDay);

        setCalculation({
            years: yearsOfService,
            gratuity: gratuityAmount,
        });
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-md max-w-4xl mx-auto border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">End of Service Gratuity Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="employee" className={formLabelClasses}>Employee</label>
                    <select
                        id="employee"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className={formSelectClasses}
                        disabled={loading}
                    >
                        {loading ? <option>Loading...</option> : employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="last-day" className={formLabelClasses}>Last Working Day</label>
                    <input
                        type="date"
                        id="last-day"
                        value={lastWorkingDay}
                        onChange={(e) => setLastWorkingDay(e.target.value)}
                        className={formInputClasses}
                    />
                </div>
                <Button onClick={handleCalculate} disabled={!selectedEmployee}>Calculate Gratuity</Button>
            </div>

            {calculation && selectedEmployee && (
                <div className="mt-6 p-4 border-t border-border">
                    <h4 className="font-bold text-xl text-center text-foreground">Calculation Result</h4>
                    <div className="mt-4 p-6 bg-secondary rounded-lg text-center">
                        <p className="text-muted-foreground">End of Service Gratuity for <span className="font-bold text-foreground">{selectedEmployee.name}</span></p>
                        <p className="text-4xl font-bold text-blue-500 dark:text-blue-400 my-2">QAR {calculation.gratuity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="mt-4 text-sm text-muted-foreground space-y-2">
                        <p className="font-semibold text-foreground text-center mb-2">Calculation Breakdown:</p>
                        <div className="flex justify-between p-2 bg-secondary rounded"><span>Years of Service:</span> <span className="font-mono">{calculation.years.toFixed(2)} years</span></div>
                        <div className="flex justify-between p-2 bg-secondary rounded"><span>Basic Salary:</span> <span className="font-mono">QAR {selectedEmployee.basicSalary.toLocaleString()}</span></div>
                         <div className="flex justify-between p-2 bg-secondary rounded"><span>Gratuity Rate:</span> <span className="font-mono">3 weeks per year</span></div>
                        <div className="flex justify-between p-2 bg-secondary rounded font-bold text-foreground"><span>Calculation:</span> <span className="font-mono">({selectedEmployee.basicSalary} / 30) * 7 * 3 * {calculation.years.toFixed(2)}</span></div>
                    </div>
                </div>
            )}
            <p className="text-xs text-center text-muted-foreground/80 mt-4">Disclaimer: This is an estimate based on the Qatar Labor Law. The final amount should be confirmed by your HR department.</p>
        </div>
    );
};

export default GratuityCalculator;