"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [complaint, setComplaint] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function savePatient() {
    alert("Rogi Save button working!");
    setMessage("");

    if (!name.trim()) {
      setMessage("Patient ka naam bharna zaroori hai.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("patients").insert([
      {
        name: name.trim(),
        age: age ? Number(age) : null,
        gender: gender || null,
        phone: phone.trim() || null,
        complaint: complaint.trim() || null,
      },
    ]);

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage("Save nahi hua: " + error.message);
      return;
    }

    setMessage("✅ Rogi successfully save ho gaya!");

    setName("");
    setAge("");
    setGender("");
    setPhone("");
    setComplaint("");
  }

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
            <input
              placeholder="रोगी का नाम"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="आयु"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">लिंग चुनें</option>
              <option value="Male">पुरुष</option>
              <option value="Female">महिला</option>
              <option value="Other">अन्य</option>
            </select>

            <input
              placeholder="मोबाइल नंबर"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <textarea
              placeholder="मुख्य शिकायत"
              rows="4"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />

            <button onClick={savePatient} disabled={saving}>
              {saving ? "⏳ Save हो रहा है..." : "💾 रोगी सहेजें"}
            </button>

            {message && (
              <p style={{ fontWeight: "bold" }}>
                {message}
              </p>
            )}

            <button onClick={() => setShowForm(false)}>
              ← वापस
            </button>
          </div>
        </>
      )}
    </main>
  );
}
