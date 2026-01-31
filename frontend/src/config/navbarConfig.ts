export type UserType = "usuario" | "empresa" | "organizacion";

interface PanelLink {
  href: string;
  label: string;
}

export interface UserNavbarConfig {
  showPoints: boolean;
  panelLink?: PanelLink;
}

export const USER_NAVBAR_CONFIG: Record<UserType, UserNavbarConfig> = {
  usuario: {
    showPoints: true,
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
