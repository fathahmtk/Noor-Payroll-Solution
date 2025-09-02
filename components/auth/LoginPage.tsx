import React, { useState } from 'react';
import { registerCompanyAndUser, requestLoginCode, verifyLoginCode } from '../../services/api';
import type { User, Role } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'details' | 'code'>('details');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;
      if (mode === 'signin') {
        response = await requestLoginCode(email);
        if (!response.success) {
          setError(response.message);
        }
      } else { // signup
        response = await registerCompanyAndUser(companyName, name, email);
        if (!response.success) {
            setError(response.message);
        }
      }
      
      if (response.success) {
          addToast(response.message, 'info');
          setStep('code');
      }

    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
        const user = await verifyLoginCode(email, code);
        if (user) {
            addToast(`Welcome, ${user.name}!`, 'success');
            onLoginSuccess(user);
        } else {
            setError('Invalid verification code.');
        }
    } catch (err) {
        setError('An error occurred during verification.');
    } finally {
        setIsLoading(false);
    }
  };

  const resetForm = () => {
      setStep('details');
      setError('');
      setCode('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-secondary">
      <div className="w-full max-w-md m-4 p-8 bg-brand-light rounded-xl shadow-lg">
        {step === 'details' ? (
            <>
                <h2 className="text-3xl font-bold text-brand-dark mb-2">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
                <p className="text-gray-600 mb-8">{mode === 'signin' ? 'Enter your email to get a verification code.' : 'Register your company and create an owner account.'}</p>
                <form className="space-y-4" onSubmit={handleDetailsSubmit}>
                    {mode === 'signup' && (
                        <>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input id="companyName" name="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-brand-primary" />
                            </div>
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Full Name</label>
                                <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-brand-primary" />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-brand-primary" />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>{mode === 'signin' ? 'Send Code' : 'Register & Send Code'}</Button>
                </form>
                 <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="mt-4 text-sm text-center w-full text-gray-600 hover:text-brand-primary">
                    {mode === 'signin' ? "Don't have an account? Create one" : "Already have an account? Sign In"}
                </button>
            </>
        ) : (
            <>
                <h2 className="text-3xl font-bold text-brand-dark mb-2">Check for the code</h2>
                <p className="text-gray-600 mb-8">We've "sent" a 6-digit code to <span className="font-semibold">{email}</span>. It will appear in a notification.</p>
                <form className="space-y-6" onSubmit={handleCodeSubmit}>
                     <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">Verification Code</label>
                        <input id="code" name="code" type="text" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-brand-primary" />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>Verify & Continue</Button>
                </form>
                <button onClick={resetForm} className="mt-4 text-sm text-center w-full text-gray-600 hover:text-brand-primary">Use a different email</button>
            </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;