import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/mockdata';
import LoginForm from './components/LoginForm';
import DemoAccounts from './components/DemoAccounts';

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding, onLoginSuccess }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState(DEMO_CREDENTIALS.player.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.player.password);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Please enter your email or username.");
      return;
    }

    const success = login(identifier, password);
    if (success) {
      onLoginSuccess();
    } else {
      setErrorMessage("Invalid credentials. Try using one of the one-click demo accounts below.");
    }
  };

  const handleDemoSelect = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white">
      {/* Top Bar with Back Button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            P
          </div>
          <span className="font-extrabold text-sm text-slate-900 font-display">Pokellects</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="space-y-2 text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to continue building and completing your personal Pokédex.
            </p>
          </div>

          <LoginForm
            identifier={identifier}
            setIdentifier={setIdentifier}
            password={password}
            setPassword={setPassword}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
          />

          <DemoAccounts onSelectAccount={handleDemoSelect} />
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="text-center text-xs text-slate-400">
        Pokellects • Personal Pokédex & Collection
      </footer>
    </div>
  );
};

export default LoginPage;
