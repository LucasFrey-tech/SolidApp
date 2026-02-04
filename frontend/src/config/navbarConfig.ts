export type NavbarRole = "usuario" | "admin" | "empresa" | "organizacion";

interface PanelLink {
  href: string;
  label: string;
}

export interface UserNavbarConfig {
  showPoints: boolean;
  panelLink?: PanelLink;
}

export const USER_NAVBAR_CONFIG: Record<NavbarRole, UserNavbarConfig> = {
  usuario: {
    showPoints: true,
  },
  admin: {
    showPoints: false,
    panelLink: {
      href: "/adminPanel",
      label: "Panel Admin",
    },
  },
  empresa: {
    showPoints: false,
    panelLink: {
      href: "/empresaPanel",
      label: "Panel Empresa",
    },
  },
  organizacion: {
    showPoints: false,
    panelLink: {
      href: "/organizacionPanel",
      label: "Panel Organización",
    },
  },
};
