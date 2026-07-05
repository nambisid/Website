import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(form.password),
  }));
  const allPasswordRulesMet = passwordChecks.every((c) => c.passed);
  const passwordsMatch =
    form.confirmPassword.length === 0 || form.password === form.confirmPassword;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!allPasswordRulesMet) {
      toast.error('Please meet all password requirements');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = form;
      await register(userData);
      toast.success('Welcome to Stitch & Bloom!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2">Create Account</h1>
          <p className="text-brand-warm-gray">Join the Stitch & Bloom family</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-brand-linen p-8">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark transition-colors"
              />
              <ul className="mt-2 space-y-1 text-xs">
                {passwordChecks.map((check) => {
                  const showAsError = submitAttempted && !check.passed;
                  const color = check.passed
                    ? 'text-green-600'
                    : showAsError
                    ? 'text-red-600'
                    : 'text-brand-warm-gray';
                  return (
                    <li key={check.label} className={`flex items-center gap-1.5 ${color}`}>
                      <span aria-hidden="true">{check.passed ? '✓' : showAsError ? '✕' : '○'}</span>
                      <span>{check.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-brand-blush-dark transition-colors ${
                  passwordsMatch ? 'border-brand-linen' : 'border-red-400'
                }`}
              />
              {!passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-brand-warm-gray mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blush-dark font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
