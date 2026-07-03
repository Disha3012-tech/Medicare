import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, User } from "../services/auth";
import { patientsService, Patient } from "../services/patients";
import { doctorsService, Doctor } from "../services/doctors";

interface AuthContextType {
  user: User | null;
  patientProfile: Patient | null;
  doctorProfile: Doctor | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (payload: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      if (currentUser.role === "PATIENT") {
        const p = await patientsService.getMe();
        setPatientProfile(p);
        setDoctorProfile(null);
      } else if (currentUser.role === "DOCTOR") {
        const d = await doctorsService.getMe();
        setDoctorProfile(d);
        setPatientProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile for user:", err);
    }
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const me = await authService.getMe();
        setUser(me);
        await fetchProfile(me);
      } catch (err) {
        console.error("Authentication check failed on mount:", err);
        setUser(null);
        setPatientProfile(null);
        setDoctorProfile(null);
      }
    } else {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const handleExpired = () => {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
    };

    window.addEventListener("auth_expired", handleExpired);
    return () => {
      window.removeEventListener("auth_expired", handleExpired);
    };
  }, []);

  const login = async (payload: any) => {
    setLoading(true);
    try {
      const data = await authService.login(payload);
      setUser(data.user);
      await fetchProfile(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      const data = await authService.register(payload);
      setUser(data.user);
      await fetchProfile(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, patientProfile, doctorProfile, loading, refreshUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};