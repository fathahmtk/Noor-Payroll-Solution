// @ts-nocheck
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function createCheckout(tenantId: string, priceId: string) {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, priceId, successUrl: window.location.href })
  });
  return res.json();
}

export async function runGenerateSifREST(runId: string) {
  const url = `${SUPABASE_URL}/functions/v1/generate-sif?runId=${encodeURIComponent(runId)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  return res.json();
}
