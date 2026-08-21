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
    setMessage("");

    // Temporary connection test
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    alert(
      supabaseUrl
        ? "Supabase URL mil raha hai ✅"
        : "SUPABASE URL MISSING ❌"
    );

    if (!name.trim()) {
      setMessage("⚠️ Patient ka naam bharna zaroori hai.");
      return;
    }

    setSaving(true);
    setMessage("⏳ Rogi save ho raha hai...");

    try {
      const patientData = {
        name: name.trim(),
        age: age ? Number(age) : null,
        gender: gender || null,
        phone: phone.trim() || null,
        complaint: complaint.trim() || null,
      };

      const { data, error } = await supabase
        .from("patients")
        .insert([patientData])
        .select();

      if (error) {
        console.error("SUPABASE ERROR:", error);

        setMessage(
          "❌ Save nahi hua: " +
            (error.message || "Unknown Supabase error")
        );

        return;
      }

      console.log("PATIENT SAVED:", data);

      setMessage("✅ Rogi successfully save ho gaya!");

      setName("");
      setAge("");
      setGender("");
      setPhone("");
      setComplaint("");
    } catch (error) {
      console.error("CONNECTION ERROR:", error);

      setMessage(
        "❌ Connection error: " +
          (error?.message || "Failed to fetch")
      );
    } finally {
      setSaving(false);
    }
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

          <div
            style={{
              display: "grid",
              gap: "12px",
              maxWidth: "420px",
            }}
          >
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

          <div
            style={{
              display: "grid",
              gap: "12px",
              maxWidth: "420px",
            }}
          >
            <input
              placeholder="रोगी का नाम"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="आयु"
              type="number"
              min="0"
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
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <textarea
              placeholder="मुख्य शिकायत"
              rows="4"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />

            <button
              onClick={savePatient}
              disabled={saving}
            >
              {saving
                ? "⏳ Save हो रहा है..."
                : "💾 रोगी सहेजें"}
            </button>

            {message && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  fontWeight: "bold",
                }}
              >
                {message}
              </div>
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
