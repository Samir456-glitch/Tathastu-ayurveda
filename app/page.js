"use client";

import { useState } from "react";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7f2",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🌿 Tathastu</h1>
      <h2>आयुर्वेद चिकित्सा सहायक</h2>

      {!showForm ? (
        <>
          <h3>वैद्य डेस्क</h3>

          <div style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
            <button onClick={() => setShowForm(true)}>
              ➕ नया रोगी
            </button>

            <button>👤 रोगी सूची</button>
            <button>📋 चिकित्सकीय परीक्षण</button>
            <button>💊 चिकित्सा / Prescription</button>
            <button>🔄 अनुवर्तन (Follow-up)</button>
            <button>🚨 आपातकाल / Referral</button>
          </div>
        </>
      ) : (
        <>
          <h3>👤 नया रोगी पंजीकरण</h3>

          <div style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
            <input placeholder="रोगी का नाम" />
            <input placeholder="आयु" type="number" />

            <select defaultValue="">
              <option value="" disabled>
                लिंग चुनें
              </option>
              <option value="Male">पुरुष</option>
              <option value="Female">महिला</option>
              <option value="Other">अन्य</option>
            </select>

            <input placeholder="मोबाइल नंबर" />
            <textarea placeholder="मुख्य शिकायत" rows="4" />

            <button>💾 रोगी सहेजें</button>

            <button onClick={() => setShowForm(false)}>
              ← वापस
            </button>
          </div>
        </>
      )}
    </main>
  );
}
