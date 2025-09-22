import React, { useState } from 'react';
import Button from './common/Button';
import { submitContactRequest } from '../services/api';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const ImageFeatureSection: React.FC<{
  title: string;
  description: string;
  imageUrl: string;
  points: string[];
  reverse?: boolean;
}> = ({ title, description, imageUrl, points, reverse = false }) => (
  <div className={`flex flex-col md:flex-row items-center gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
    <div className="md:w-1/2">
      <h3 className="text-3xl font-bold text-dark-foreground">{title}</h3>
      <p className="mt-4 text-dark-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-4">
        {points.map((point, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span className="text-dark-muted-foreground">{point}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="md:w-1/2">
      <img src={imageUrl} alt={title} className="rounded-xl shadow-lg object-cover w-full h-80" />
    </div>
  </div>
);

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        company: '',
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setStatusMessage('Sending...');
        try {
            await submitContactRequest(formData);
            setStatus('success');
            setStatusMessage('Thanks! We will contact you shortly.');
            setFormData({ company: '', name: '', email: '', phone: '', message: '' }); // Reset form
        } catch (error) {
            setStatus('error');
            setStatusMessage('An error occurred. Please try again later.');
            console.error(error);
        }
    };
    
    if (status === 'success') {
        return (
            <div className="bg-dark-card p-8 rounded-lg text-center border border-green-500/50 transition-all animate-fade-in">
                <h3 className="text-xl font-bold text-green-400">Thank You!</h3>
                <p className="mt-2 text-dark-muted-foreground">{statusMessage}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-dark-card p-8 rounded-lg space-y-6 border border-dark-border text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-dark-muted-foreground">Company</label>
                    <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full bg-dark-secondary border-dark-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark-muted-foreground">Your Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-dark-secondary border-dark-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark-muted-foreground">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-dark-secondary border-dark-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-dark-muted-foreground">Phone (Optional)</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full bg-dark-secondary border-dark-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-dark-muted-foreground">Message (Optional)</label>
                <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleChange} className="mt-1 block w-full bg-dark-secondary border-dark-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"></textarea>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex-grow">
                    {status !== 'idle' && (
                        <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-dark-muted-foreground'}`}>{statusMessage}</p>
                    )}
                </div>
                <Button type="submit" isLoading={status === 'sending'} className="ml-auto">Request Demo</Button>
            </div>
        </form>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignUpClick }) => {
  return (
    <div className="dark bg-dark-background text-dark-foreground min-h-screen">
      <header className="bg-dark-secondary/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl" role="img" aria-label="Qatar Flag">🇶🇦</span>
            <h1 className="text-xl font-bold tracking-tight text-dark-foreground">Noor HR</h1>
          </div>
           <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm hover:text-blue-400 transition-colors">Features</a>
            <a href="#contact" className="text-sm hover:text-blue-400 transition-colors">Contact</a>
          </nav>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onLoginClick}>Login</Button>
            <Button onClick={onSignUpClick}>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
          Comprehensive HR & Payroll. <span className="text-blue-400">Made Simple.</span>
        </h2>
        <p className="mt-4 text-lg text-dark-muted-foreground max-w-2xl mx-auto">
          Noor is the all-in-one platform to manage your HR, payroll, and compliance needs in Qatar, ensuring you are always WPS compliant.
        </p>
        <div className="mt-8">
          <Button onClick={onSignUpClick} className="px-8 py-3 text-base">
            Get Started For Free
          </Button>
        </div>
      </main>

      <section id="features" className="bg-dark-background py-20">
        <div className="container mx-auto px-6 space-y-24">
           <ImageFeatureSection 
              title="Effortless WPS Payroll"
              description="Run compliant payroll in minutes. Our automated system handles complex calculations and generates the correct SIF for your bank, saving you hours of manual work."
              imageUrl="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop"
              points={["Automated Salary Information File (SIF) Generation", "Compliant with Qatar Central Bank regulations", "Handles allowances, deductions, and provisions seamlessly"]}
            />
            <ImageFeatureSection 
              title="Centralized Employee Hub"
              description="Manage your entire workforce from a single, intuitive dashboard. Track employee documents, manage leave, and handle the entire employee lifecycle from onboarding to offboarding."
              imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
              points={["Secure document management with expiry alerts", "Streamlined leave and attendance tracking", "Complete onboarding and offboarding checklists"]}
              reverse={true}
            />
            <ImageFeatureSection 
              title="Streamline Your Hiring"
              description="Attract top talent and manage your entire hiring process with our integrated recruitment module, from posting jobs to seamless onboarding."
              imageUrl="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop"
              points={["Post job openings and manage them effectively.", "Visualize your process with a drag-and-drop candidate pipeline.", "Convert hired candidates to employees with a single click."]}
            />
             <ImageFeatureSection 
              title="Intelligent AI Assistance"
              description="Empower your HR team with powerful AI tools. Generate job descriptions, draft official HR policies, and get instant answers to common HR questions, all within the app."
              imageUrl="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop"
              points={["AI-powered HR policy writer", "Instant answers from an AI HR assistant", "Automated job description generation"]}
              reverse={true}
            />
            <ImageFeatureSection 
              title="Complete Operations Management"
              description="Go beyond HR with integrated tools to manage company assets, vehicle fleets, and departmental petty cash, all in one place."
              imageUrl="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
              points={["Full asset lifecycle tracking from purchase to retirement.", "Log vehicle usage, monitor expiry dates, and manage assignments.", "Streamline petty cash requests with approval workflows."]}
            />
        </div>
      </section>

      <section id="contact" className="bg-dark-secondary py-20">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-dark-foreground">Ready to streamline your HR?</h2>
            <p className="mt-4 text-lg text-dark-muted-foreground max-w-2xl mx-auto">
                Request a personalized demo or contact us for more information. Our team is ready to help.
            </p>
            <div className="mt-12 max-w-xl mx-auto">
                <ContactForm />
            </div>
        </div>
      </section>

      <footer className="bg-dark-background text-white py-12">
        <div className="container mx-auto px-6 text-center text-sm text-dark-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Noor HR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;