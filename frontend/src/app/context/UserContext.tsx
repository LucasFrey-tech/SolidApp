"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

import { Rol } from "@/API/types/auth";
import { GestionTipo } from "@/API/types/gestion/enum";
import { baseApi } from "@/API/baseApi";

export interface User {
  sub: number;
  email: string | undefined;
  username: string;
  rol: Rol;
  gestion?: GestionTipo | null;
  gestionId?: number | null;

  organizacionId?: number | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<User>(token);

      const perfil: any = await baseApi.usuario.getPerfil();

      setUser({
        sub: decoded.sub,
        username: `${perfil.nombre} ${perfil.apellido}`,
        rol: decoded.rol,
        gestion: decoded.gestion,
        gestionId: decoded.gestionId,
        email: perfil.contacto?.correo,
        organizacionId: perfil.organizacion_usuario?.[0]?.id_organizacion ?? null
      });

    } catch (error) {
      console.error("Error cargando usuario:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
