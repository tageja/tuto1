'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface SchoolContextValue {
  selectedSchool: string | null;
  joinedSchools: string[];
  selectSchool: (name: string | null) => void;
  joinByCode: (code: string) => Promise<{ ok: boolean; schoolName?: string; message?: string }>;
}

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [joinedSchools, setJoinedSchools] = useState<string[]>([]);

  useEffect(() => {
    try {
      const cookieSchool = readCookie('selectedSchool');
      const lsSchool = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedSchool') : null;
      const initial = cookieSchool || lsSchool;
      if (initial) setSelectedSchool(initial);
      const lsJoined = typeof localStorage !== 'undefined' ? localStorage.getItem('joinedSchools') : null;
      if (lsJoined) setJoinedSchools(JSON.parse(lsJoined));
    } catch {}
  }, []);

  const selectSchool = (name: string | null) => {
    setSelectedSchool(name);
    if (typeof localStorage !== 'undefined') {
      if (name) localStorage.setItem('selectedSchool', name);
      else localStorage.removeItem('selectedSchool');
    }
    if (name) writeCookie('selectedSchool', name);
  };

  const joinByCode = async (code: string) => {
    try {
      const res = await fetch('/api/schools/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, message: text };
      }
      const data = await res.json();
      const schoolName = data?.schoolName as string | undefined;
      if (schoolName) {
        selectSchool(schoolName);
        setJoinedSchools((prev) => {
          const next = Array.from(new Set([...(prev || []), schoolName]));
          try { if (typeof localStorage !== 'undefined') localStorage.setItem('joinedSchools', JSON.stringify(next)); } catch {}
          return next;
        });
      }
      return { ok: true, schoolName };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Join failed' };
    }
  };

  const value = useMemo(() => ({ selectedSchool, joinedSchools, selectSchool, joinByCode }), [selectedSchool, joinedSchools]);
  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export const useSchool = (): SchoolContextValue => {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error('useSchool must be used within SchoolProvider');
  return ctx;
};


