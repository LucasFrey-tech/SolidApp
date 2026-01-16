"use client";

import { useEffect, useState } from "react";
import { CampaignForm } from "./CampainForm";
import { Edit2 } from "lucide-react";
import styles from "@/styles/organizationPanel.module.css";
import formStyles from "@/styles/campaignPanel.module.css";

type Campaign = {
  id: string;
  titulo: string;
  descripcion: string;
  objetivo: number;
};

export default function OrganizationCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    // ejemplo inicial
    setCampaigns([
      { id: "1", titulo: "Campaña 1", descripcion: "Descripcion 1", objetivo: 100 },
      { id: "2", titulo: "Campaña 2", descripcion: "Descripcion 2", objetivo: 200 },
    ]);
  }, []);

  const handleSave = (data: Partial<Campaign>) => {
    if (editingCampaign) {
      // editar
      setCampaigns((prev) =>
        prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...data } : c))
      );
    } else {
      // agregar nueva
      setCampaigns((prev) => [
        ...prev,
        { id: (prev.length + 1).toString(), titulo: data.titulo!, descripcion: data.descripcion!, objetivo: data.objetivo! },
      ]);
    }
    setEditingCampaign(null);
    setOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Campañas</h2>
        <button className={styles.button} onClick={() => { setEditingCampaign(null); setOpen(true); }}>
          Agregar campaña
        </button>
      </div>

      <div className={styles.divider} />

      {campaigns.length === 0 ? (
        <p className={styles.empty}>No hay campañas todavía</p>
      ) : (
        <ul className={styles.list}>
          {campaigns.map((c) => (
            <li key={c.id} className={styles.card}>
              <div>
                <strong>{c.titulo}</strong> — {c.descripcion} — Objetivo: {c.objetivo}
              </div>
              <Edit2 className={styles.editIcon} onClick={() => { setEditingCampaign(c); setOpen(true); }} />
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className={formStyles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={formStyles.modal} onClick={(e) => e.stopPropagation()}>
            <CampaignForm
              campaign={editingCampaign || undefined}
              onClose={() => { setOpen(false); setEditingCampaign(null); }}
              onSuccess={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}
