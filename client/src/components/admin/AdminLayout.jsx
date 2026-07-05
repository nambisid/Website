import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: HiOutlineChartBar, end: true },
  { to: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { to: '/admin/categories', label: 'Categories', icon: HiOutlineTag },
  { to: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: HiOutlineUsers },
  { to: '/admin/reviews', label: 'Reviews', icon: HiOutlineStar },
  { to: '/admin/inventory', label: 'Inventory', icon: HiOutlineCube },
  { to: '/admin/site-content', label: 'Site Content', icon: HiOutlineCog },
  { to: '/admin/team', label: 'Team', icon: HiOutlineShieldCheck },
  { to: '/admin/account', label: 'My Account', icon: HiOutlineUserCircle },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-ivory flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 animate-(--animate-fade-in)"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-white border-r border-brand-linen flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-brand-linen">
          <Link to="/admin" className="block">
            <div className="font-serif text-xl text-brand-charcoal leading-tight">
              Yume Yarns
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-brand-blush-dark font-sans mt-0.5">
              Admin Console
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-blush/30 text-brand-blush-dark shadow-sm'
                          : 'text-brand-charcoal hover:bg-brand-cream'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-6 border-t border-brand-linen">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-warm-gray hover:bg-brand-cream transition-all"
            >
              <HiOutlineHome size={18} />
              <span>View Site</span>
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-brand-linen">
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-brand-charcoal truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-brand-warm-gray truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-error hover:bg-red-50 transition-all"
          >
            <HiOutlineLogout size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-brand-linen sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-brand-charcoal"
            >
              <HiOutlineMenuAlt2 size={22} />
            </button>
            <span className="font-serif text-lg">Admin</span>
            <Link to="/" className="text-xs text-brand-blush-dark font-medium">
              View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-(--animate-fade-in)">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
