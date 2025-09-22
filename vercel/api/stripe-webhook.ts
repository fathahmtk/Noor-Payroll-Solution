// @ts-nocheck
/// <reference types="node" />

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sig = req.headers['stripe-signature'] as string;
  
  const buf = await new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const customer = invoice.customer;

    const tenantsRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/tenants?stripe_customer_id=eq.${customer}`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      }
    });
    const tenants = await tenantsRes.json() as any[];

    if (tenants.length) {
      const tid = tenants[0].id;
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/tenants?id=eq.${tid}`, {
        method: 'PATCH',
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription: 'Premium' })
      });
    }
  }

  res.json({ received: true });
}
