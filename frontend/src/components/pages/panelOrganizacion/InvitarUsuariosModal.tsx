"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/invitaciones/invitaciones.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (emails: string[]) => void;
};

export default function InvitarUsuariosModal({
  open,
  onClose,
  onSend,
}: Props) {
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [emails, setEmails] = useState<string[]>([]);

  // Resetear el estado cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      setCantidad(null);
      setEmails([]);
    }
  }, [open]);

  if (!open) return null;

  const handleCantidad = (num: number) => {
    const value = Math.max(1, Math.min(5, num));
    setCantidad(value);
    setEmails(Array(value).fill(""));
  };

  const handleEmailChange = (index: number, value: string) => {
    const copy = [...emails];
    copy[index] = value;
    setEmails(copy);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {cantidad === null ? (
          <>
            <h2>¿Cuántos usuarios querés invitar?</h2>

            <input
              type="number"
              min={1}
              max={5}
              className={styles.numberInput}
              onChange={(e) => handleCantidad(Number(e.target.value))}
              placeholder="Máximo 5"
            />

            <button className={styles.cancel} onClick={onClose}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <h2>Ingresar mails</h2>

            <div className={styles.inputs}>
              {emails.map((email, i) => (
                <input
                  key={i}
                  type="email"
                  placeholder={`Email ${i + 1}`}
                  value={email}
                  onChange={(e) => handleEmailChange(i, e.target.value)}
                />
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.send}
                onClick={() => onSend(emails)}
              >
                Enviar invitaciones
              </button>

              <button className={styles.cancel} onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}