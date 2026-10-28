import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User | null) => void;
  onRegisterUser: (newUser: User) => void;
  onOpenAdminConsole: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  users,
  onSelectUser,
  onRegisterUser,
  onOpenAdminConsole,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === usernameInput.trim().toLowerCase() ||
        u.email.toLowerCase() === usernameInput.trim().toLowerCase()
    );
    if (!found) {
      setErrorMsg(
        'Username not found. Try "alex_guest" or "admin", or register below.'
      );
      return;
    }
    onSelectUser(found);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regName.trim() || !regUsername.trim() || !regEmail.trim()) {
      setErrorMsg('Please complete all required registration fields.');
      return;
    }
    const newUser: User = {
      _id: `usr-${Date.now().toString().slice(-5)}`,
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim() || '+30 694 000 1122',
      role: 'guest',
    };
    onRegisterUser(newUser);
    onSelectUser(newUser);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="i movies Account Authentication"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white font-display">
            i movies Member Access
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Demo Switcher */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-zinc-400">
              Instant Account Switcher
            </p>
            <div className="grid grid-cols-1 gap-2">
              {users.slice(0, 3).map((u) => {
                const isSelected = currentUser?._id === u._id;
                return (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {u.role === 'guest' ? (
                        <UserIcon className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {u.name} (@{u.username})
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Role: {u.role} · {u.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-400">
                      {isSelected ? 'Active' : 'Use'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentUser && currentUser.role !== 'guest' && (
            <button
              type="button"
              onClick={() => {
                onOpenAdminConsole();
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-emerald-500 text-zinc-950 rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Go to Admin Console
            </button>
          )}

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register New Account
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-400">{errorMsg}</p>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Username or Email
                </label>
                <input
                  id="login-username"
                  type="text"
                  required
                  placeholder="alex_guest or admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Sign In to i movies
                </button>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUser(null);
                      onClose();
                    }}
                    className="px-4 py-2.5 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Nikos Kazantzakis"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-username"
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    placeholder="nikos_k"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-phone"
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Mobile Phone
                  </label>
                  <input
                    id="reg-phone"
                    type="text"
                    placeholder="+30 694 222 3344"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="nikos@imovies.cinema"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
