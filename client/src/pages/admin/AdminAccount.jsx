import { useState } from 'react';
import { HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/userApi';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const AdminAccount = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(form.newPassword),
  }));
  const allRulesMet = passwordChecks.every((c) => c.passed);
  const passwordsMatch =
    form.confirmPassword.length === 0 || form.newPassword === form.confirmPassword;
  const isSamePassword =
    form.currentPassword && form.newPassword === form.currentPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!form.currentPassword) return toast.error('Enter your current password');
    if (!allRulesMet) return toast.error('New password does not meet requirements');
    if (form.newPassword !== form.confirmPassword)
      return toast.error('Passwords do not match');
    if (isSamePassword)
      return toast.error('New password must be different from current');

    setSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed. Please sign in with your new password.');
      // Force logout on this device too — safer
      setTimeout(async () => {
        await logout();
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">My Account</h1>
        <p className="text-brand-warm-gray mt-1">
          Manage your sign-in details.
        </p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-brand-linen p-6 animate-(--animate-fade-up)">
        <h2 className="text-lg font-serif mb-4">Profile</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-brand-warm-gray">Name</dt>
            <dd className="font-medium">
              {user?.firstName} {user?.lastName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-warm-gray">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-warm-gray">Role</dt>
            <dd>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-blush/30 text-brand-blush-dark capitalize">
                {user?.role}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-brand-linen p-6 space-y-4 animate-(--animate-fade-up)"
      >
        <div>
          <h2 className="text-lg font-serif">Change Password</h2>
          <p className="text-xs text-brand-warm-gray mt-1">
            You'll be signed out of all devices and need to sign back in with your
            new password.
          </p>
        </div>

        <Field label="Current Password">
          <input
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
            className="account-input"
          />
        </Field>

        <Field label="New Password">
          <input
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="account-input"
          />
          <ul className="mt-2 space-y-1 text-xs">
            {passwordChecks.map((check) => {
              const showError = submitAttempted && !check.passed;
              const color = check.passed
                ? 'text-green-600'
                : showError
                ? 'text-red-600'
                : 'text-brand-warm-gray';
              return (
                <li
                  key={check.label}
                  className={`flex items-center gap-1.5 ${color}`}
                >
                  <span aria-hidden="true">
                    {check.passed ? '✓' : showError ? '✕' : '○'}
                  </span>
                  <span>{check.label}</span>
                </li>
              );
            })}
            {form.newPassword && isSamePassword && (
              <li className="flex items-center gap-1.5 text-red-600">
                <span aria-hidden="true">✕</span>
                <span>Must be different from current password</span>
              </li>
            )}
          </ul>
        </Field>

        <Field label="Confirm New Password">
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className={`account-input ${
              !passwordsMatch ? 'border-red-400' : ''
            }`}
          />
          {!passwordsMatch && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
          )}
        </Field>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 disabled:opacity-50"
          >
            {saving ? (
              'Updating...'
            ) : (
              <>
                <HiOutlineCheck size={18} />
                Update Password
              </>
            )}
          </button>
        </div>

        <style>{`
          .account-input {
            width: 100%;
            padding: 0.625rem 0.875rem;
            background: white;
            border: 1px solid var(--color-brand-linen);
            border-radius: 0.75rem;
            font-size: 0.875rem;
          }
          .account-input:focus {
            outline: none;
            border-color: var(--color-brand-blush-dark);
          }
        `}</style>
      </form>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default AdminAccount;
