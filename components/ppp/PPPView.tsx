import React, { useState } from 'react';
import Card from '../common/Card.tsx';
import Button from '../common/Button.tsx';
import LoanIcon from '../icons/LoanIcon.tsx';

interface LoanResult {
    loanAmount: number;
    payrollCosts: number;
    otherCosts: number;
}

const PPPView: React.FC = () => {
    const [employeeCount, setEmployeeCount] = useState('');
    const [monthlyPayroll, setMonthlyPayroll] = useState('');
    const [result, setResult] = useState<LoanResult | null>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const payroll = parseFloat(monthlyPayroll);
        if (isNaN(payroll) || payroll <= 0) {
            setResult(null);
            return;
        }

        const loanAmount = payroll * 2.5;
        const payrollCosts = loanAmount * 0.60;
        const otherCosts = loanAmount * 0.40;

        setResult({
            loanAmount,
            payrollCosts,
            otherCosts,
        });
    };
    
    const formatCurrency = (amount: number) => {
        return `QAR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <Card 
                    title="PPP Loan Calculator"
                    icon={<LoanIcon className="w-6 h-6"/>}
                    subtitle="Estimate your potential Paycheck Protection Program loan amount."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <form onSubmit={handleCalculate} className="space-y-4">
                            <div>
                                <label htmlFor="employeeCount" className="block text-sm font-medium text-muted-foreground">Number of Employees</label>
                                <input 
                                    type="number" 
                                    id="employeeCount" 
                                    value={employeeCount}
                                    onChange={(e) => setEmployeeCount(e.target.value)}
                                    className="mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary"
                                    placeholder="e.g., 50"
                                />
                            </div>
                             <div>
                                <label htmlFor="monthlyPayroll" className="block text-sm font-medium text-muted-foreground">Average Monthly Payroll Cost (QAR)</label>
                                <input 
                                    type="number" 
                                    id="monthlyPayroll"
                                    value={monthlyPayroll}
                                    onChange={(e) => setMonthlyPayroll(e.target.value)} 
                                    className="mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary"
                                    placeholder="e.g., 150000"
                                    required
                                />
                            </div>
                            <Button type="submit">Calculate</Button>
                        </form>
                        
                        <div className="bg-secondary p-6 rounded-lg border border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Results</h3>
                            {result ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Estimated Loan Amount</p>
                                        <p className="text-3xl font-bold text-primary">{formatCurrency(result.loanAmount)}</p>
                                    </div>
                                    <div className="border-t border-border my-2 pt-2 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Portion for Payroll Costs (60%)</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(result.payrollCosts)}</span>
                                        </div>
                                         <div className="flex justify-between">
                                            <span className="text-muted-foreground">Portion for Other Costs (40%)</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(result.otherCosts)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>Enter your payroll details to see an estimate.</p>
                                </div>
                            )}
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground/80 mt-6 text-center">
                        Disclaimer: This calculator provides an estimate based on standard PPP guidelines (2.5x monthly payroll, 60/40 cost split) and is for informational purposes only. It is not financial advice. Please consult with a financial advisor and refer to official program rules.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default PPPView;
