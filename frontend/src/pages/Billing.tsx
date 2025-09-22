// @ts-nocheck
/// <reference types="vite/client" />

import React from 'react';
import { createCheckout } from '../services/api';

export default function Billing({ tenantId }: { tenantId: string }) {
  async function subscribe() {
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID!;
    const res = await createCheckout(tenantId, priceId);
    if (res?.url) window.location.href = res.url;
    else alert('Checkout error');
  }

  return (
    <div>
      <h2>Billing</h2>
      <button onClick={subscribe}>Upgrade to Premium</button>
    </div>
  );
}
