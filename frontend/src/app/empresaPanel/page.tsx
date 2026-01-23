"use client";

import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import styles from "@/styles/organizationPanel.module.css";
import formStyles from "@/styles/campaignPanel.module.css";
import { CouponForm } from "./cuponForm";

/* ===============================
   TIPOS
================================ */
type Coupon = {
  id: number;
  titulo: string;
  detalle: string;
  cantidad: number;
};

/* ===============================
   COMPONENTE
================================ */
export default function OrganizationCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  /* ===============================
    MOCK
  ================================ */
  useEffect(() => {
    setCoupons([
      {
        id: 1,
        titulo: "Descuento 15%",
        detalle: "Descuento en supermercado",
        cantidad: 50,
      },
      {
        id: 2,
        titulo: "2x1 Café",
        detalle: "Válido de lunes a viernes",
        cantidad: 30,
      },
    ]);
  }, []);

  /* ===============================
     GUARDAR CUPÓN
  ================================ */
  const handleSaveCoupon = (data: Partial<Coupon>) => {
    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id ? { ...c, ...data } : c
        )
      );
    } else {
      setCoupons((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          titulo: data.titulo!,
          detalle: data.detalle!,
          cantidad: data.cantidad!,
        },
      ]);
    }

    setEditingCoupon(null);
    setOpen(false);
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h2>Panel de Empresa</h2>

        <button
          className={styles.button}
          onClick={() => {
            setEditingCoupon(null);
            setOpen(true);
          }}
        >
          Agregar cupón
        </button>
      </div>

      <div className={styles.divider} />

      {/* LISTADO DE CUPONES */}
      <ul className={styles.list}>
        {coupons.map((c) => (
          <li key={c.id} className={styles.card}>
            <div>
              <strong>{c.titulo}</strong> — {c.detalle} — Cantidad:{" "}
              {c.cantidad}
            </div>

            <Edit2
              className={styles.editIcon}
              onClick={() => {
                setEditingCoupon(c);
                setOpen(true);
              }}
            />
          </li>
        ))}
      </ul>

      {/* MODAL */}
      {open && (
        <div
          className={formStyles.modalOverlay}
          onClick={() => setOpen(false)}
        >
          <div
            className={formStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <CouponForm
              coupon={editingCoupon || undefined}
              onClose={() => {
                setOpen(false);
                setEditingCoupon(null);
              }}
              onSuccess={handleSaveCoupon}
            />
          </div>
        </div>
      )}
    </div>
  );
}
