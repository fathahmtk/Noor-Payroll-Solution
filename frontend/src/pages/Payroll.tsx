import React, { useState } from 'react';
import { supabase, runGenerateSifREST } from '../services/api';

export default function Payroll({ tenantId }: { tenantId: string }) {
  const [runId, setRunId] = useState('');

  async function createRun() {
    const period = new Date().toISOString().slice(0,7);
    const payDate = new Date().toISOString().slice(0,10);
    const { data, error } = await supabase.from('payroll_runs')
      .insert([{ tenant_id: tenantId, period, pay_date: payDate, status: 'Draft' }])
      .select().single();
    
    if (error) alert(error.message);
    else setRunId(data.id);
  }

  async function generateSif() {
    if (!runId) return alert('Create a run first');
    const json = await runGenerateSifREST(runId);
    if (json?.url) window.open(json.url, '_blank');
    else alert('SIF error: ' + JSON.stringify(json));
  }

  return (
    <div>
      <h2>Payroll</h2>
      <button onClick={createRun}>Create Payroll Run</button>
      <input value={runId} onChange={e=>setRunId(e.target.value)} placeholder="Run ID" style={{ marginTop: 10, marginBottom: 10 }} />
      <button onClick={generateSif}>Generate SIF</button>
    </div>
  );
}