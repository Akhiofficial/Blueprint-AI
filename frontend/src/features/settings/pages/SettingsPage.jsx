import { useState, useEffect } from 'react';
import { useAuthContext } from '../../auth/auth.context';
import useAuth from '../../auth/hooks/useAuth';
import DashboardLayout from '../../../layouts/DashboardLayout';

const SettingsPage = () => {
  const { user } = useAuthContext();
  const { handleLogout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Track if changes are made to trigger the beforeunload listener
  const hasUnsavedChanges = user?.name !== name || avatarFile !== null;

  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Derived member since
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Report missing backend endpoint
    setIsSaving(false);
    setErrorMsg('Profile Settings UI implemented; backend profile update endpoint still required.');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Semantic CSS variables for easy dark/light mode implementation in the future.
  // Currently defaults to the global dark theme values for UI consistency.
  const themeVars = {
    '--theme-bg': 'transparent', // DashboardLayout handles main background
    '--theme-card': '#0D1117',
    '--theme-text-main': 'rgba(255, 255, 255, 0.95)',
    '--theme-text-secondary': 'rgba(255, 255, 255, 0.85)',
    '--theme-text-muted': 'rgba(255, 255, 255, 0.45)',
    '--theme-border': 'rgba(255, 255, 255, 0.07)',
    '--theme-input-bg': 'rgba(255, 255, 255, 0.03)',
    '--theme-input-border': 'rgba(255, 255, 255, 0.1)',
    '--theme-btn-disabled': 'rgba(255, 255, 255, 0.05)',
    '--theme-btn-disabled-text': 'rgba(255, 255, 255, 0.3)',
    '--theme-danger-bg': 'rgba(239, 68, 68, 0.05)',
    '--theme-danger-border': 'rgba(239, 68, 68, 0.1)',
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8" style={themeVars}>
        <h1 className="text-xl font-bold mb-1.5" style={{ color: 'var(--theme-text-main)' }}>Settings</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--theme-text-muted)' }}>Manage your account preferences and details.</p>

        <div className="grid gap-6">
          
          {/* Profile Section */}
          <section 
            className="rounded-2xl p-6 md:p-8 transition-colors"
            style={{ 
              background: 'var(--theme-card)', 
              border: '1px solid var(--theme-border)'
            }}
          >
            <h2 className="text-sm font-semibold mb-6" style={{ color: 'var(--theme-text-secondary)' }}>Profile</h2>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="relative group">
                <div 
                  className="flex h-16 w-16 items-center justify-center rounded-full shrink-0 text-xl font-bold text-white shadow-lg overflow-hidden bg-cover bg-center"
                  style={{ 
                    background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'linear-gradient(135deg, #3B82F6, #22D3EE)' 
                  }}
                >
                  {!avatarPreview && (user?.name?.[0]?.toUpperCase() ?? '?')}
                </div>
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Profile Photo</p>
                <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>Click your avatar to upload a new image.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{
                    background: 'var(--theme-input-bg)',
                    border: '1px solid var(--theme-input-border)',
                    color: 'var(--theme-text-main)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>Email Address</label>
                <input 
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none cursor-not-allowed opacity-70"
                  style={{
                    background: 'var(--theme-input-bg)',
                    border: '1px solid var(--theme-input-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                />
                <p className="text-[0.65rem] mt-1.5" style={{ color: 'var(--theme-text-muted)' }}>Email cannot be changed.</p>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="px-4 py-3 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="px-4 py-3 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#6EE7B7', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {successMsg}
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button 
                  type="submit"
                  disabled={!hasUnsavedChanges || isSaving}
                  className="px-6 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  style={{ 
                    background: (hasUnsavedChanges && !isSaving) ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : 'var(--theme-btn-disabled)', 
                    color: (hasUnsavedChanges && !isSaving) ? '#fff' : 'var(--theme-btn-disabled-text)',
                    boxShadow: (hasUnsavedChanges && !isSaving) ? '0 4px 12px rgba(59,130,246,0.25)' : 'none',
                    border: 'none'
                  }}
                >
                  {isSaving ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
                {hasUnsavedChanges && !isSaving && (
                  <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>You have unsaved changes.</span>
                )}
              </div>
            </form>
          </section>

          {/* Account Information Section */}
          <section 
            className="rounded-2xl p-6 md:p-8 transition-colors"
            style={{ 
              background: 'var(--theme-card)', 
              border: '1px solid var(--theme-border)'
            }}
          >
            <h2 className="text-sm font-semibold mb-6" style={{ color: 'var(--theme-text-secondary)' }}>Account Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl transition-colors" style={{ background: 'var(--theme-input-bg)', border: '1px solid var(--theme-input-border)' }}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Role</p>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--theme-text-secondary)' }}>{user?.role || 'User'}</p>
              </div>
              <div className="p-4 rounded-xl transition-colors" style={{ background: 'var(--theme-input-bg)', border: '1px solid var(--theme-input-border)' }}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Member Since</p>
                <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>{memberSince}</p>
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section 
            className="rounded-2xl p-6 md:p-8 flex items-center justify-between transition-colors"
            style={{ 
              background: 'var(--theme-danger-bg)', 
              border: '1px solid var(--theme-danger-border)'
            }}
          >
            <div>
              <h2 className="text-sm font-semibold mb-1" style={{ color: '#FCA5A5' }}>Log Out</h2>
              <p className="text-xs" style={{ color: 'rgba(252, 165, 165, 0.7)' }}>End your current session safely.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-lg text-xs font-medium transition-all shadow-lg hover:shadow-red-500/20"
              style={{
                background: 'linear-gradient(135deg, #991B1B, #EF4444)',
                color: '#fff',
                border: 'none'
              }}
            >
              Sign out
            </button>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
