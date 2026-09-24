'use client';

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: 'Ramesh Patil', mobile: '9876543210', location: 'Nashik, Maharashtra', language: 'Hindi' });

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  return (
    <main className="page-shell">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black text-slate-900">{t('profile')}</h1><span className={`rounded-full px-3 py-1.5 text-sm font-bold ${user?.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : user?.status === 'NOT VERIFIED' || user?.status === 'SUSPICIOUS' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{user?.status === 'VERIFIED' ? `Verified ${user.role === 'farmer' ? 'Farmer' : 'Buyer'}` : user?.status === 'SUSPICIOUS' ? 'Verification Required' : 'Verification Pending'}</span></div>
        <p className="mt-2 text-xs text-slate-500">Verification score is a risk indicator for review, not proof that a person is trustworthy.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {editing ? <>
              <div><label className="label" htmlFor="profile-name">Name</label><input id="profile-name" value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} className="w-full" /></div>
              <div><label className="label" htmlFor="profile-mobile">Mobile</label><input id="profile-mobile" value={profile.mobile} onChange={(event) => updateProfile('mobile', event.target.value)} className="w-full" /></div>
              <div><label className="label" htmlFor="profile-location">Location</label><input id="profile-location" value={profile.location} onChange={(event) => updateProfile('location', event.target.value)} className="w-full" /></div>
              <div><label className="label" htmlFor="profile-language">Preferred language</label><select id="profile-language" value={profile.language} onChange={(event) => updateProfile('language', event.target.value)} className="w-full"><option>Hindi</option><option>English</option><option>Marathi</option><option>Telugu</option></select></div>
            </> : <>
              <div><p className="text-sm text-slate-500">Name</p><p className="text-lg font-bold text-slate-900">{profile.name}</p></div>
              <div><p className="text-sm text-slate-500">Mobile</p><p className="text-lg font-bold text-slate-900">{profile.mobile}</p></div>
              <div><p className="text-sm text-slate-500">Location</p><p className="text-lg font-bold text-slate-900">{profile.location}</p></div>
              <div><p className="text-sm text-slate-500">Preferred language</p><p className="text-lg font-bold text-slate-900">{profile.language}</p></div>
            </>}
          </div>

          <div className="space-y-4">
            <div><p className="text-sm text-slate-500">Crops</p><p className="text-lg font-bold text-slate-900">Rice, Wheat, Cotton</p></div>
            <div><p className="text-sm text-slate-500">Farm details</p><p className="text-lg font-bold text-slate-900">10 acres • Irrigation available</p></div>
            <div><p className="text-sm text-slate-500">Transaction history</p><p className="text-lg font-bold text-slate-900">5 completed, 2 pending</p></div>
          </div>
        </div>

        {editing ? <div className="mt-6 flex gap-3"><button type="button" onClick={() => { setEditing(false); setSaved(true); }} className="btn-primary">Save Profile</button><button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button></div> : <button type="button" onClick={() => { setEditing(true); setSaved(false); }} className="btn-primary mt-6">Edit Profile</button>}
        {saved && <p className="mt-3 text-sm font-semibold text-emerald-700">Profile updated successfully.</p>}
      </div>
    </main>
  );
}
