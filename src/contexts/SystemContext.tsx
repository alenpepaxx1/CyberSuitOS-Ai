/* COPYRIGHT ALEN PEPA */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SystemStats {
  cpu: number;
  ram: number;
  memory: number;
  uptime: number;
  hostname: string;
  platform: string;
  arch: string;
  loadAvg: number[];
  totalMem: number;
  freeMem: number;
}

import { auth, db, signInWithGoogle, logout as firebaseLogout, FirebaseUser } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface SystemContextType {
  stats: SystemStats | null;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  toolTarget: string;
  setToolTarget: (target: string) => void;
  isSystemReady: boolean;
  alerts: any[];
  addAlert: (alert: any) => void;
  refreshStats: () => Promise<void>;
  // Config
  theme: string;
  setTheme: (theme: string) => void;
  showScanlines: boolean;
  setShowScanlines: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  firewallEnabled: boolean;
  setFirewallEnabled: (enabled: boolean) => void;
  vpnEnabled: boolean;
  setVpnEnabled: (enabled: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  clearanceLevel: number;
  setClearanceLevel: (level: number) => void;
  // Auth
  user: FirebaseUser | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTool, setActiveTool] = useState('dashboard');
  const [toolTarget, setToolTarget] = useState('');
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Config State
  const [theme, setTheme] = useState('default');
  const [showScanlines, setShowScanlines] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [userName, setUserName] = useState('GUEST_USER');
  const [clearanceLevel, setClearanceLevel] = useState(1);

  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: 'user',
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, newUser);
        setUserName(newUser.displayName);
        setClearanceLevel(2);
      } else {
        const userData = userDoc.data();
        setUserName(userData.displayName || 'Anonymous');
        setClearanceLevel(userData.role === 'admin' ? 4 : 2);
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        syncUserProfile(firebaseUser);
      } else {
        setUserName('GUEST_USER');
        setClearanceLevel(1);
      }
      setIsAuthReady(true);
    });

    // Fallback for offline/placeholder mode or slow connection
    const fallbackTimer = setTimeout(() => {
      setIsAuthReady(true);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          ...data,
          ram: data.ram || data.memory // Ensure ram exists
        });
        setIsSystemReady(true);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const addAlert = (alert: any) => {
    setAlerts(prev => [alert, ...prev].slice(0, 50));
  };

  return (
    <SystemContext.Provider value={{ 
      stats, 
      activeTool, 
      setActiveTool, 
      toolTarget,
      setToolTarget,
      isSystemReady, 
      alerts, 
      addAlert,
      refreshStats: fetchStats,
      theme,
      setTheme,
      showScanlines,
      setShowScanlines,
      showGrid,
      setShowGrid,
      firewallEnabled,
      setFirewallEnabled,
      vpnEnabled,
      setVpnEnabled,
      userName,
      setUserName,
      clearanceLevel,
      setClearanceLevel,
      user,
      isAuthReady,
      login,
      logout
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
