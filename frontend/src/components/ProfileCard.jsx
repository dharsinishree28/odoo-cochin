import React from 'react';

export default function ProfileCard({ user, stats }) {
  const profile = stats?.user_profile || {
    name: user?.full_name || 'Carlic Bolomboy',
    email: user?.email || 'carlic@gmai.com',
    projects: 26,
    followers: 356,
    following: 68
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col items-center justify-center text-center">
      {/* 3D Avatar circle */}
      <div className="relative mb-3">
        <div className="w-16 h-16 rounded-full bg-[#FFE3D1] border-2 border-white shadow-sm flex items-center justify-center text-3xl overflow-hidden ring-4 ring-[#F2F5F3]">
          🧑‍💻
        </div>
      </div>

      <h3 className="text-base font-bold text-charcoal tracking-tight">
        {profile.name}
      </h3>
      <p className="text-xs text-slate-subtle mt-0.5">
        {profile.email}
      </p>

      {/* 3 Column Stats below */}
      <div className="grid grid-cols-3 gap-4 w-full mt-5 pt-4 border-t border-[#F0F3F1]">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-muted">Projects</p>
          <p className="text-lg font-extrabold text-charcoal mt-0.5">{profile.projects}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-muted">Followers</p>
          <p className="text-lg font-extrabold text-charcoal mt-0.5">{profile.followers}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-muted">Following</p>
          <p className="text-lg font-extrabold text-charcoal mt-0.5">{profile.following}</p>
        </div>
      </div>
    </div>
  );
}
