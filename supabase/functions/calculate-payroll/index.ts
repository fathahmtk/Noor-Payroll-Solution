// @ts-nocheck
/// <reference types="https://deno.land/x/sift@0.6.0/sift.d.ts" />

import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://deno.land/x/supabase@1.13.0/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
    try {
        const url = new URL(req.url);
        const runId = url.searchParams.get('runId');
        if (!runId) return new Response(JSON.stringify({ error: 'Missing runId' }), { status: 400 });

        const { data, error } = await supabase.rpc('payroll_calculate_run', { p_run_id: runId });

        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

        return new Response(JSON.stringify({ result: data }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});
