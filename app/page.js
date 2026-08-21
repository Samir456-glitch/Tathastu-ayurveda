"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [screen, setScreen] = useState("home");

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loadingPatients, setLoadingPatients] = useState(false);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [complaint, setComplaint] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // SAVE PATIENT
  // =========================

  async function savePatient() {
    setMessage("");

    if (!name.trim()) {
      setMessage("⚠️ रोगी का नाम भरना जरूरी है।");
      return;
    }

    setSaving(true);
    setMessage("⏳ रोगी save हो रहा है...");

    try {
      const patient = {
        name: name.trim(),
        age: age ? Number(age) : null,
        gender: gender || null,
        phone: phone.trim() || null,
        complaint: complaint.trim() || null,
      };

      const { data, error } = await supabase
        .from("patients")
        .insert([patient])
        .select()
        .single();

      if (error) {
        console.error("SUPABASE ERROR:", error);
        setMessage("❌ Save नहीं हुआ: " + error.message);
        return;
      }

      console.log("PATIENT SAVED:", data);

      setMessage("✅ रोगी successfully save हो गया!");

      setName("");
      setAge("");
      setGender("");
      setPhone("");
      setComplaint("");

    } catch (error) {
      console.error("SAVE ERROR:", error);

      setMessage(
        "❌ Connection error: " +
          (error?.message || "Failed to fetch")
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // FETCH PATIENTS
  // =========================

  async function fetchPatients() {
    try {
      setLoadingPatients(true);

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("PATIENT LIST ERROR:", error);
        alert("रोगी सूची लोड नहीं हुई: " + error.message);
        return;
      }

      setPatients(data || []);

    } catch (error) {
      console.error(error);
      alert(
        "रोगी सूची लोड नहीं हुई: " +
          (error?.message || "Unknown error")
      );
    } finally {
      setLoadingPatients(false);
    }
  }

  // =========================
  // OPEN PATIENT LIST
  // =========================

  function openPatientList() {
    setSearch("");
    setSelectedPatient(null);
    setScreen("patients");
    fetchPatients();
  }

  // =========================
  // FILTER PATIENTS
  // =========================

  const searchText = search.toLowerCase().trim();

  const filteredPatients = patients.filter((p) => {
    const patientName = (p.name || "").toLowerCase();
    const patientPhone = (p.phone || "").toString();

    return (
      patientName.includes(searchText) ||
      patientPhone.includes(searchText)
    );
  });

  // =========================
  // HOME SCREEN
  // =========================

  if (screen === "home") {
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

        <h3>वैद्य डेस्क</h3>

        <div
          style={{
            display: "grid",
            gap: "12px",
            maxWidth: "420px",
          }}
        >
          <button onClick={() => setScreen("newPatient")}>
            ➕ नया रोगी
          </button>

          <button onClick={openPatientList}>
            👤 रोगी सूची
          </button>

          <button>
            📋 चिकित्सकीय परीक्षण
          </button>

          <button>
            💊 चिकित्सा / Prescription
          </button>

          <button>
            🔄 अनुवर्तन (Follow-up)
          </button>

          <button>
            🚨 आपातकाल / Referral
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // NEW PATIENT SCREEN
  // =========================

  if (screen === "newPatient") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7f2",
          padding: "24px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <button
          onClick={() => {
            setMessage("");
            setScreen("home");
          }}
          style={{
            marginBottom: "15px",
            padding: "8px 14px",
          }}
        >
          ← वापस
        </button>

        <h2>👤 नया रोगी पंजीकरण</h2>

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
            onChange={(e) =>
              setComplaint(e.target.value)
            }
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
                background: "#fff",
                fontWeight: "bold",
              }}
            >
              {message}
            </div>
          )}
        </div>
      </main>
    );
  }

  // =========================
  // PATIENT LIST SCREEN
  // =========================

  if (screen === "patients") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7f2",
          padding: "16px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <button
          onClick={() => setScreen("home")}
          style={{
            padding: "8px 14px",
            marginBottom: "12px",
          }}
        >
          ← वापस
        </button>

        <h2>👤 पंजीकृत रोगी सूची</h2>

        <input
          type="text"
          placeholder="🔎 नाम या मोबाइल नंबर से खोजें..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "12px",
            boxSizing: "border-box",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "16px",
          }}
        />

        {loadingPatients ? (
          <p>⏳ रोगी सूची लोड हो रही है...</p>
        ) : filteredPatients.length === 0 ? (
          <p style={{ color: "#777" }}>
            कोई रोगी नहीं मिला।
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "480px",
            }}
          >
            {filteredPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPatient(p);
                  setScreen("profile");
                }}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "14px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontWeight: "bold",
                  }}
                >
                  <span>
                    👤 {p.name}
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    {p.age
                      ? `${p.age} वर्ष`
                      : ""}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    marginTop: "5px",
                  }}
                >
                  📱 {p.phone || "N/A"}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  <strong>
                    शिकायत:
                  </strong>{" "}
                  {p.complaint || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // PATIENT PROFILE
  // =========================

  if (screen === "profile" && selectedPatient) {
    const p = selectedPatient;

    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7f2",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <button
          onClick={() => setScreen("patients")}
          style={{
            padding: "8px 14px",
            marginBottom: "15px",
          }}
        >
          ← रोगी सूची
        </button>

        <h2>👤 रोगी प्रोफाइल</h2>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "18px",
            maxWidth: "480px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3>
            {p.name || "नाम उपलब्ध नहीं"}
          </h3>

          <p>
            <strong>आयु:</strong>{" "}
            {p.age || "—"}
          </p>

          <p>
            <strong>लिंग:</strong>{" "}
            {p.gender || "—"}
          </p>

          <p>
            <strong>मोबाइल:</strong>{" "}
            {p.phone || "—"}
          </p>

          <p>
            <strong>मुख्य शिकायत:</strong>
            <br />
            {p.complaint || "—"}
          </p>

          <p>
            <strong>Patient ID:</strong>{" "}
            {p.id}
          </p>

          <hr />

          <h3>🩺 आगे की चिकित्सा</h3>

          <button
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            📋 Clinical Assessment
          </button>

          <button
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            💊 Prescription
          </button>

          <button
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            🔄 Follow-up History
          </button>

          <button
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
            📝 Clinical Notes
          </button>
        </div>
      </main>
    );
  }

  return null;
}
