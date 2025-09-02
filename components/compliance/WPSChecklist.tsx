import React, { useState } from 'react';

interface ChecklistItem {
    id: number;
    text: string;
    checked: boolean;
}

const initialItems: ChecklistItem[] = [
    { id: 1, text: "Register the company with the Ministry of Labor.", checked: true },
    { id: 2, text: "Open a corporate bank account in Qatar.", checked: true },
    { id: 3, text: "Ensure all employees have valid QIDs and work permits.", checked: false },
    { id: 4, text: "Ensure all employees have a local Qatari bank account with an IBAN.", checked: false },
    { id: 5, text: "Pay salaries in Qatari Riyals (QAR).", checked: true },
    { id: 6, text: "Process payroll and pay salaries on or before the 7th of each month.", checked: false },
    { id: 7, text: "Generate a Salary Information File (SIF) in the correct format for each payroll run.", checked: false },
    { id: 8, text: "Upload the SIF file to the bank for salary disbursement.", checked: false },
    { id: 9, text: "Keep accurate records of all payroll transactions for auditing purposes.", checked: false },
];

const WPSChecklist: React.FC = () => {
    const [items, setItems] = useState<ChecklistItem[]>(initialItems);

    const handleToggle = (id: number) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };
    
    const progress = (items.filter(item => item.checked).length / items.length) * 100;

    return (
        <div className="bg-brand-light p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-brand-dark mb-2">WPS Compliance Checklist</h3>
            <p className="text-sm text-gray-500 mb-4">Track your company's adherence to the Wage Protection System requirements.</p>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div 
                    className="bg-accent h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <ul className="space-y-3">
                {items.map(item => (
                    <li key={item.id}>
                        <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggle(item.id)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <span className={`ml-3 text-sm font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {item.text}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WPSChecklist;