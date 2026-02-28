import { RolCuenta } from "@/API/types/auth";

export type NavbarRole = RolCuenta;

interface PanelLink {
  href: string;
  label: string;
}

export interface UserNavbarConfig {
  showPoints: boolean;
  panelLink?: PanelLink;
}

export const USER_NAVBAR_CONFIG: Record<NavbarRole, UserNavbarConfig> = {
  [RolCuenta.USUARIO]: {
    showPoints: true,
  },
  [RolCuenta.ADMIN]: {
    showPoints: false,
    panelLink: {
      href: "/adminPanel",
      label: "Panel Admin",
    },
  },
  [RolCuenta.EMPRESA]: {
    showPoints: false,
    panelLink: {
      href: "/empresaPanel",
      label: "Panel Empresa",
    },
  },
  [RolCuenta.ORGANIZACION]: {
    showPoints: false,
    panelLink: {
      href: "/organizacionPanel",
      label: "Panel Organización",
    },
  },
};
