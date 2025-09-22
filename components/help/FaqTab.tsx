import React from 'react';
import Accordion from '../common/Accordion';

const faqs = [
    {
        category: 'General',
        questions: [
            { q: "What is Noor HR?", a: "Noor HR is a comprehensive HR and payroll management system designed specifically for companies in Qatar. It helps you manage employees, run WPS-compliant payroll, track assets, and much more." },
            { q: "How do I change my theme?", a: "You can toggle between light and dark themes by clicking the sun/moon icon in the top navigation bar, next to the notifications bell." },
        ]
    },
    {
        category: 'Employees',
        questions: [
            { q: "How do I add a new employee?", a: "Navigate to the 'Employees' view from the sidebar, then click the 'New Employee' button in the header. Fill out the form and click 'Add Employee'." },
            { q: "Can I convert a hired candidate into an employee?", a: "Yes. In the 'Recruitment' > 'Candidate Pipeline' view, find the candidate in the 'Hired' column. Click to view their details, and you will see a 'Convert to Employee' button. This will pre-fill the new employee form with the candidate's information." },
            { q: "How do I view the organization chart?", a: "Click on 'Organization Chart' under the 'Workforce' section in the sidebar to see a visual hierarchy of your company." },
        ]
    },
    {
        category: 'Payroll & WPS',
        questions: [
            { q: "How do I run monthly payroll?", a: "Go to the 'Payroll & WPS' view. Click the 'Run New Payroll' button in the header. Confirm the details, and the system will process the payroll and generate a WPS-compliant SIF file for you to download." },
            { q: "What is a SIF file?", a: "A Salary Information File (SIF) is a specific file format required by Qatari banks for processing salaries through the Wage Protection System (WPS). Noor HR automatically generates this for you." },
        ]
    }
];

const FaqTab: React.FC = () => {
    return (
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h3>
            <div className="space-y-8">
                {faqs.map(category => (
                    <div key={category.category}>
                        <h4 className="text-lg font-semibold text-muted-foreground mb-4">{category.category}</h4>
                        <div className="space-y-3">
                            {category.questions.map((faq, index) => (
                                <Accordion key={index} title={faq.q}>
                                    <p>{faq.a}</p>
                                </Accordion>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqTab;
