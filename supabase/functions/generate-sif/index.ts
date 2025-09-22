// @ts-nocheck
/// <reference types="https://deno.land/x/sift@0.6.0/sift.d.ts" />

import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://deno.land/x/supabase@1.13.0/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function toFixed2(n: number) {
    return (Math.round(n * 100) / 100).toFixed(2);
}

async function buildCsv(tenantEid: string, rows: Array<any>, payDate: string) {
    // Template header - adjust per bank if needed
    const now = new Date();
    const fileDate = now.toISOString().slice(0,10).replace(/-/g,'');
    const fileTime = now.toTimeString().slice(0,5).replace(':','');
    const totalAmount = rows.reduce((s, r) => s + Number(r.net_pay), 0);
    const headerRow = [tenantEid, fileDate, fileTime, 'QAR', toFixed2(totalAmount), String(rows.length), '01'];

    // Record fields - adjust as bank spec
    const records = rows.map(r => {
        return [
            tenantEid,
            r.employee_qid || '',
            r.employee_name || '',
            r.iban || '',
            toFixed2(Number(r.net_pay)),
            'QAR',
            payDate
        ];
    });

    const csvLines = [headerRow.join(','), ...records.map(r => r.join(','))];
    return csvLines.join('\n');
}

serve(async (req: Request) => {
    try {
        const url = new URL(req.url);
        const runId = url.searchParams.get('runId');
        if (!runId) return new Response(JSON.stringify({ error: 'Missing runId' }), { status: 400 });

        // fetch payroll_run
        const { data: runs, error: runError } = await supabase
            .from('payroll_runs')
            .select('*')
            .eq('id', runId)
            .single();
        
        if (runError || !runs) {
            return new Response(JSON.stringify({ error: 'Payroll run not found' }), { status: 404 });
        }
        
        // fetch payroll_records with employee info
        const { data: records, error: recordsError } = await supabase
            .from('payroll_records')
            .select('*, employees(name, qid, iban)')
            .eq('payroll_run_id', runId);

        if (recordsError) throw recordsError;

        // Normalize into rows
        const rows = (records as any[]).map(r => {
            return {
                employee_name: r.employees.name,
                employee_qid: r.employees.qid,
                iban: r.employees.iban,
                net_pay: r.net_pay
            };
        });
        
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('employer_eid')
            .eq('id', runs.tenant_id)
            .single();

        if (tenantError) throw tenantError;

        const employerEid = tenant?.employer_eid || '';
        const csv = await buildCsv(employerEid, rows, (runs.pay_date || new Date()).toISOString().slice(0,10));
        
        // store to Supabase Storage
        const filePath = `sifs/${runs.tenant_id}/${runs.id}.csv`;
        const { error: uploadError } = await supabase.storage
            .from('sif-files')
            .upload(filePath, new Blob([csv]), { upsert: true });

        if (uploadError) throw uploadError;
        
        // get public URL signed (expires)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('sif-files')
            .createSignedUrl(filePath, 60 * 60); // 1 hour

        if (signedUrlError) throw signedUrlError;

        await supabase.from('payroll_runs').update({ status: 'Generated' }).eq('id', runs.id);

        return new Response(JSON.stringify({ url: signedUrlData.signedUrl }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});
