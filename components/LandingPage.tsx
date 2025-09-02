import React from 'react';
import Button from './common/Button';
import PayrollIcon from './icons/PayrollIcon';
import EmployeesIcon from './icons/EmployeesIcon';
import AssetIcon from './icons/AssetIcon';
import ComplianceIcon from './icons/ComplianceIcon';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex-shrink-0 bg-brand-primary-light text-brand-primary p-4 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-brand-dark">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignUpClick }) => {
  return (
    <div className="bg-gray-soft min-h-screen">
      <header className="bg-brand-light shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl" role="img" aria-label="Qatar Flag">🇶🇦</span>
            <h1 className="text-xl font-bold tracking-tight text-brand-dark">Noor Payroll Solution</h1>
          </div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onLoginClick}>Login</Button>
            <Button onClick={onSignUpClick}>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-brand-dark leading-tight">
          WPS Comprehensive Payroll. <span className="text-brand-primary">Made Simple.</span>
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Noor is the all-in-one platform to manage your HR, payroll, and compliance needs in Qatar, ensuring you are always WPS compliant.
        </p>
        <div className="mt-8">
          <Button onClick={onSignUpClick} className="px-8 py-3 text-base">
            Get Started For Free
          </Button>
        </div>
      </main>

      <section className="bg-brand-light py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-brand-dark">Everything you need in one place</h3>
            <p className="mt-2 text-md text-slate-500">From onboarding to payroll, we've got you covered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <Feature icon={<PayrollIcon className="w-8 h-8"/>} title="Automated WPS Payroll" description="Run monthly payroll and generate SIF files compliant with Qatar's WPS regulations in minutes." />
            <Feature icon={<EmployeesIcon className="w-8 h-8"/>} title="Full Employee Lifecycle" description="Manage employee profiles, documents, and important dates from onboarding to offboarding." />
            <Feature icon={<AssetIcon className="w-8 h-8"/>} title="Asset Management" description="Track company assets assigned to employees, including laptops, phones, and key cards." />
            <Feature icon={<ComplianceIcon className="w-8 h-8"/>} title="Compliance & Reporting" description="Stay compliant with Qatar Labor Law with built-in tools and generate insightful HR reports." />
          </div>
        </div>
      </section>

      <footer className="bg-brand-dark text-white py-8">
        <div className="container mx-auto px-6 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Noor Payroll Solution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;