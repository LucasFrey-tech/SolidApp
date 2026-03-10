import { Rol } from "@/API/types/auth";

export type NavbarRole = Rol;

interface PanelLink {
  href: string;
  label: string;
}

export interface UserNavbarConfig {
  showPoints: boolean;
  panelLink?: PanelLink;
}

export const USER_NAVBAR_CONFIG: Record<NavbarRole, UserNavbarConfig> = {
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
  [Rol.GESTOR]: {
    showPoints: false,
    /*panelLink: {
      href: "/adminPanel",
      label: "Panel Admin",
    },*/
  },
};
