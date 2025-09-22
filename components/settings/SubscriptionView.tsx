import React from 'react';
import { useAppContext } from '../../AppContext.tsx';
import { SubscriptionTier } from '../../types.ts';
import Button from '../common/Button.tsx';
import { updateSubscriptionTier } from '../../services/api.ts';
import { useToasts } from '../../hooks/useToasts.tsx';

const SubscriptionView: React.FC = () => {
    const { tenant, refreshTenant, currentUser } = useAppContext();
    const { addToast } = useToasts();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleUpgrade = async (newTier: SubscriptionTier) => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            await updateSubscriptionTier(currentUser.tenantId, newTier);
            await refreshTenant();
            addToast(`Successfully subscribed to the ${newTier} plan!`, 'success');
        } catch (error) {
            addToast('Failed to update subscription.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const plans = [
        { tier: SubscriptionTier.Free, name: 'Free', price: 'QAR 0', features: ['Employee Self-Service', 'Leave Management', 'Up to 10 Employees'] },
        { tier: SubscriptionTier.Premium, name: 'Premium', price: 'QAR 20 / emp / mo', features: ['All Free features', 'Payroll & WPS', 'Time & Attendance', 'Asset Management'] },
        { tier: SubscriptionTier.Enterprise, name: 'Enterprise', price: 'QAR 35 / emp / mo', features: ['All Premium features', 'Recruitment Module', 'Analytics & Reports', 'Audit Trail & Admin Controls'] },
    ];

    return (
        <div className="bg-card p-8 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">Subscription & Billing</h3>
            <p className="text-sm text-muted-foreground mb-6">Your current plan is <span className="font-semibold text-primary capitalize">{tenant?.subscriptionTier}</span>.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                    <div key={plan.tier} className={`p-6 rounded-lg border-2 flex flex-col ${tenant?.subscriptionTier === plan.tier ? 'border-primary' : 'border-border'}`}>
                        <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                        <p className="text-2xl font-extrabold text-primary my-2">{plan.price}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground mt-4 flex-grow">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            {tenant?.subscriptionTier === plan.tier ? (
                                <Button className="w-full" disabled>Current Plan</Button>
                            ) : (
                                <Button variant="secondary" className="w-full" onClick={() => handleUpgrade(plan.tier)} isLoading={isLoading}>
                                    { (plans.findIndex(p => p.tier === tenant?.subscriptionTier) < index) ? 'Upgrade' : 'Downgrade' }
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionView;