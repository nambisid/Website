import { useEffect, useState } from 'react';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { listAllUsers, updateUserRole } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminTeam = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listAllUsers();
      setUsers(data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (target, newRole) => {
    const verb = newRole === 'admin' ? 'promote' : 'demote';
    const ok = window.confirm(
      newRole === 'admin'
        ? `Make ${target.firstName} ${target.lastName} an admin?\n\nThey will be able to manage products, orders, customers, and grant admin access to others.`
        : `Demote ${target.firstName} ${target.lastName} to a customer?\n\nThey will lose access to the admin console immediately.`
    );
    if (!ok) return;

    setActingId(target._id);
    try {
      const { data } = await updateUserRole(target._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === target._id ? { ...u, role: data.data.role } : u))
      );
      toast.success(data.message || `User ${verb}d`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${verb} user`);
    } finally {
      setActingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.length - adminCount;

  return (
    <div className="space-y-6">
      <div className="animate-(--animate-fade-down)">
        <h1 className="text-3xl font-serif text-brand-charcoal">Team</h1>
        <p className="text-brand-warm-gray mt-1">
          Manage who has access to this admin console. Promote a customer to admin
          to share management duties.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md animate-(--animate-fade-up)">
        <Stat
          icon={HiOutlineShieldCheck}
          label="Admins"
          value={adminCount}
          accent="bg-brand-blush/30 text-brand-blush-dark"
        />
        <Stat
          icon={HiOutlineUser}
          label="Customers"
          value={customerCount}
          accent="bg-brand-sage/30 text-brand-sage-dark"
        />
      </div>

      <div className="relative max-w-md animate-(--animate-fade-up)">
        <HiOutlineSearch
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-warm-gray"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-linen rounded-xl focus:outline-none focus:border-brand-blush-dark"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-linen p-12 text-center animate-(--animate-fade-up)">
          <p className="text-brand-warm-gray">
            {search ? 'No matching users.' : 'No users yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-linen overflow-hidden animate-(--animate-fade-up)">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream">
              <tr className="text-left text-xs text-brand-warm-gray uppercase tracking-wider">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const isMe = u._id === currentUser?._id;
                const isAdmin = u.role === 'admin';
                return (
                  <tr
                    key={u._id}
                    className="border-t border-brand-linen hover:bg-brand-cream/40 transition-colors animate-(--animate-fade-in)"
                    style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                            isAdmin
                              ? 'bg-brand-blush text-brand-blush-dark'
                              : 'bg-brand-linen text-brand-warm-gray'
                          }`}
                        >
                          {u.firstName?.[0]}
                          {u.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">
                            {u.firstName} {u.lastName}
                            {isMe && (
                              <span className="ml-2 text-xs text-brand-warm-gray">
                                (you)
                              </span>
                            )}
                          </div>
                          {u.isEmailVerified && (
                            <div className="text-[10px] text-brand-sage-dark">
                              ✓ Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-warm-gray">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          isAdmin
                            ? 'bg-brand-blush/30 text-brand-blush-dark'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isAdmin ? (
                          <>
                            <HiOutlineShieldCheck size={12} />
                            Admin
                          </>
                        ) : (
                          'Customer'
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-warm-gray text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isMe ? (
                        <span className="text-xs text-brand-warm-gray italic">
                          —
                        </span>
                      ) : isAdmin ? (
                        <button
                          onClick={() => handleRoleChange(u, 'customer')}
                          disabled={actingId === u._id}
                          className="px-3 py-1.5 text-xs border border-brand-linen rounded-lg font-medium hover:bg-red-50 hover:text-brand-error hover:border-brand-error disabled:opacity-40"
                        >
                          {actingId === u._id ? '...' : 'Revoke admin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(u, 'admin')}
                          disabled={actingId === u._id}
                          className="px-3 py-1.5 text-xs bg-brand-blush-dark text-white rounded-lg font-medium hover:bg-brand-blush-dark/90 disabled:opacity-40"
                        >
                          {actingId === u._id ? '...' : 'Make admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-brand-cream rounded-2xl p-5 text-sm animate-(--animate-fade-up)">
        <p className="font-medium text-brand-charcoal mb-1">Safety rules</p>
        <ul className="text-brand-warm-gray space-y-1 list-disc list-inside">
          <li>You cannot change your own role — ask another admin.</li>
          <li>The last remaining admin cannot be demoted (prevents lockout).</li>
          <li>To grant admin access to a new person: ask them to register first as a customer at <code>/register</code>, then promote them here.</li>
        </ul>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-brand-linen p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={20} />
    </div>
    <div>
      <div className="text-xs text-brand-warm-gray uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-serif">{value}</div>
    </div>
  </div>
);

export default AdminTeam;
