import { Rol } from "@/API/types/auth";
import { GestionTipo } from "@/API/types/gestion/enum";

export type NavbarRole = Rol;

interface PanelLink {
  href: string;
  label: string;
}

export interface UserNavbarConfig {
  showPoints: boolean;
  panelLink?: PanelLink;
}

export const USER_NAVBAR_CONFIG: Record<Exclude<NavbarRole, Rol.COLABORADOR>, UserNavbarConfig> = {
  [Rol.USUARIO]: {
    showPoints: true,
  },
  [Rol.ADMIN]: {
    showPoints: false,
    panelLink: {
      href: "/adminPanel",
      label: "Panel Admin",
    },
  },
};

export const getGestorNavbarConfig = (gestion: GestionTipo | null | undefined): UserNavbarConfig => {
  if (gestion === GestionTipo.EMPRESA) {
    return {
      showPoints: false,
      panelLink: {
        href: "/empresaPanel",
        label: "Panel Empresa",
      },
    };
  }

  if (gestion === GestionTipo.ORGANIZACION) {
    return {
      showPoints: false,
      panelLink: {
        href: "/organizacionPanel",
        label: "Panel Organización",
      },
    };
  }

  return {
    showPoints: false,
  };
};