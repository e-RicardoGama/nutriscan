"use client";

import { useState, useEffect } from "react";
import api from "../services/api";

export default function ConsentimentoLGPD() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lgpdConsent");
    if (!consent) setVisible(true);
  }, []);

  const sendConsentToBackend = async (status: "accepted" | "rejected") => {
    try {
      await api.post("/lgpd-consent", {
        status,
        timestamp: new Date().toISOString(),
      });
      console.log("✅ Consentimento enviado ao backend:", status);
    } catch (err) {
      console.error("❌ Erro ao registrar consentimento no backend:", err);
    }
  };

  const handleAccept = () => {
    localStorage.setItem("lgpdConsent", "accepted");
    sendConsentToBackend("accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("lgpdConsent", "rejected");
    sendConsentToBackend("rejected");

    // Bloquear cookies não essenciais (analytics, marketing, etc.)
    if (typeof window !== "undefined") {
      const cookiesToRemove = ["_ga", "_gid", "_fbp"];
      cookiesToRemove.forEach((cookie) => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white text-sm p-4 shadow-lg z-50">
      <p className="mb-2">
        Nós utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, analisar o tráfego e personalizar conteúdo conforme a LGPD.  
        Consulte nossa{" "}
        <a href="/politica-privacidade" className="underline text-blue-300">Política de Privacidade</a> e{" "}
        <a href="/politica-cookies" className="underline text-blue-300">Política de Cookies</a> para mais informações.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
        >
          Aceitar
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}
