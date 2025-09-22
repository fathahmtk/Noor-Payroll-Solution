import React from 'react';
import Home from './pages/Home';
import Billing from './pages/Billing';
import Payroll from './pages/Payroll';
import KnowledgeBase from './components/KnowledgeBase';

export default function App() {
  const tenantId = 'demo-tenant-uuid'; // replace after auth integration
  return (
    <div className="container">
      <header>
        <h1>Noor HR</h1>
        <nav>
          <a href="#home">Home</a> | <a href="#billing">Billing</a> | <a href="#payroll">Payroll</a> | <a href="#kb">Knowledge Base</a>
        </nav>
      </header>
      <section id="home" className="card"><Home /></section>
      <section id="billing" className="card"><Billing tenantId={tenantId} /></section>
      <section id="payroll" className="card"><Payroll tenantId={tenantId} /></section>
      <section id="kb" className="card"><KnowledgeBase tenantId={tenantId} /></section>
    </div>
  );
}