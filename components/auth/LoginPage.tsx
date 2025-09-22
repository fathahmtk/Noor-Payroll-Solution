import React, { useState } from 'react';
import { registerCompanyAndUser, requestLoginCode, verifyLoginCode, loginWithGoogle, loginWithMicrosoft } from '../../services/api';
import type { User, Role } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const SocialButton: React.FC<{ provider: 'Google' | 'Microsoft', onClick: () => void, disabled?: boolean }> = ({ provider, onClick, disabled }) => {
    const icons = {
        Google: (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 6.04C34.553 2.372 29.658 0 24 0C10.745 0 0 10.745 0 24s10.745 24 24 24c13.255 0 24-10.745 24-24c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691L12.959 19.336C14.665 13.102 18.957 8.92 24 8.92c3.059 0 5.842 1.154 7.961 3.039L38.802 6.04C34.553 2.372 29.658 0 24 0C10.745 0 0 10.745 0 24c0 2.309.337 4.533.938 6.641z"></path><path fill="#4CAF50" d="M24 48c5.643 0 10.719-1.845 14.898-4.959l-6.522-5.023C29.431 41.291 26.891 44 24 44c-5.216 0-9.559-3.92-11.044-9.043l-6.713 5.222C9.255 43.136 15.974 48 24 48z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 6.04C34.553 2.372 29.658 0 24 0C10.745 0 0 10.745 0 24s10.745 24 24 24c13.255 0 24-10.745 24-24c0-1.341-.138-2.65-.389-3.917z"></path>
            </svg>
        ),
        Microsoft: (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                 <path fill="#F25022" d="M1 1h10v10H1z"></path><path fill="#00A4EF" d="M1 13h10v10H1z"></path><path fill="#7FBA00" d="M13 1h10v10H13z"></path><path fill="#FFB900" d="M13 13h10v10H13z"></path>
            </svg>
        )
    };
    return (
        <button onClick={onClick} disabled={disabled} className="w-full inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-dark-card text-dark-foreground border border-dark-border hover:bg-dark-muted focus:ring-dark-ring px-4 py-2 text-sm">
            {icons[provider]}
            Sign in with {provider}
        </button>
    );
};

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
  
  const handleGoogleLogin = async () => {
      setError('');
      setIsLoading(true);
      try {
          const user = await loginWithGoogle();
          if (user) {
              addToast(`Welcome back, ${user.name}!`, 'success');
              onLoginSuccess(user);
          } else {
              setError('Could not log in with Google. Please try again.');
          }
      } catch (err) {
          setError('An error occurred during Google Sign-In.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleMicrosoftLogin = async () => {
      setError('');
      setIsLoading(true);
      try {
          const user = await loginWithMicrosoft();
          if (user) {
              addToast(`Welcome back, ${user.name}!`, 'success');
              onLoginSuccess(user);
          } else {
              setError('Could not log in with Microsoft. Please try again.');
          }
      } catch (err) {
          setError('An error occurred during Microsoft Sign-In.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen dark bg-dark-background text-dark-foreground">
      <div className="w-full max-w-md m-4 p-8 bg-dark-card rounded-xl shadow-lg border border-dark-border">
        {step === 'details' ? (
            <>
                <h2 className="text-3xl font-bold text-dark-foreground mb-2">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
                <p className="text-dark-muted-foreground mb-8">{mode === 'signin' ? 'Enter your email to get a verification code.' : 'Register your company and create an owner account.'}</p>
                <form className="space-y-4" onSubmit={handleDetailsSubmit}>
                    {mode === 'signup' && (
                        <>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-dark-muted-foreground">Company Name</label>
                                <input id="companyName" name="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 bg-dark-secondary block w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-dark-ring" />
                            </div>
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-dark-muted-foreground">Your Full Name</label>
                                <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-dark-secondary block w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-dark-ring" />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-dark-muted-foreground">Email Address</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-dark-secondary block w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-dark-ring" />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>{mode === 'signin' ? 'Send Code' : 'Register & Send Code'}</Button>
                </form>

                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-dark-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-dark-card px-2 text-dark-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                    <SocialButton provider="Google" onClick={handleGoogleLogin} disabled={isLoading} />
                    <SocialButton provider="Microsoft" onClick={handleMicrosoftLogin} disabled={isLoading} />
                </div>
                 
                 <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="mt-6 text-sm text-center w-full text-dark-muted-foreground hover:text-dark-primary" disabled={isLoading}>
                    {mode === 'signin' ? "Don't have an account? Create one" : "Already have an account? Sign In"}
                </button>
            </>
        ) : (
            <>
                <h2 className="text-3xl font-bold text-dark-foreground mb-2">Check for the code</h2>
                <p className="text-dark-muted-foreground mb-8">We've "sent" a 6-digit code to <span className="font-semibold text-dark-foreground">{email}</span>. It will appear in a notification.</p>
                <form className="space-y-6" onSubmit={handleCodeSubmit}>
                     <div>
                        <label htmlFor="code" className="block text-sm font-medium text-dark-muted-foreground">Verification Code</label>
                        <input id="code" name="code" type="text" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 bg-dark-secondary block w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-dark-ring" />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>Verify & Continue</Button>
                </form>
                <button onClick={resetForm} className="mt-4 text-sm text-center w-full text-dark-muted-foreground hover:text-dark-primary">Use a different email</button>
            </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;