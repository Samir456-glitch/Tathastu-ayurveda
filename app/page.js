"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

// Helper component for clean input fields
function AssessmentInput({ label, value, onChange, textarea = false }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          rows="3"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState("home");

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [search, setSearch] = useState("");

  // New patient
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [complaint, setComplaint] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Clinical Assessment
  const [assessment, setAssessment] = useState({
    pulse: "",
    dosha: "",
    dhatu: "",
    mala: "",
    agni: "",
    ama: "",
    prakriti: "",
    vikriti: "",

    ashtavidha_nadi: "",
    ashtavidha_mutra: "",
    ashtavidha_mala: "",
    ashtavidha_jihwa: "",
    ashtavidha_shabda: "",
    ashtavidha_sparsha: "",
    ashtavidha_drik: "",
    ashtavidha_akriti: "",

    samprapti: "",
    diagnosis: "",
    treatment_plan: "",
    clinical_notes: "",
  });

  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");

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
    setMessage("⏳ रोगी सहेजा जा रहा है...");

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

      setMessage("✅ रोगी सफलतापूर्वक सहेजा गया!");
      setName("");
      setAge("");
      setGender("");
      setPhone("");
      setComplaint("");
    } catch (error) {
      console.error("SAVE ERROR:", error);
      setMessage("❌ Connection error: " + (error?.message || "Failed to fetch"));
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
      alert("रोगी सूची लोड नहीं हुई: " + (error?.message || "Unknown error"));
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
  // ASSESSMENT FIELD UPDATE
  // =========================
  function updateAssessment(field, value) {
    setAssessment((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // =========================
  // SAVE CLINICAL ASSESSMENT
  // =========================
  async function saveAssessment() {
    if (!selectedPatient?.id) {
      setAssessmentMessage("❌ रोगी का चयन नहीं हुआ है।");
      return;
    }

    setSavingAssessment(true);
    setAssessmentMessage("⏳ Clinical Assessment सहेजा जा रहा है...");

    try {
      const assessmentData = {
        patient_id: selectedPatient.id,
        pulse: assessment.pulse,
        dosha: assessment.dosha,
        dhatu: assessment.dhatu,
        mala: assessment.mala,
        agni: assessment.agni,
        ama: assessment.ama,
        prakriti: assessment.prakriti,
        vikriti: assessment.vikriti,
        ashtavidha_nadi: assessment.ashtavidha_nadi,
        ashtavidha_mutra: assessment.ashtavidha_mutra,
        ashtavidha_mala: assessment.ashtavidha_mala,
        ashtavidha_jihwa: assessment.ashtavidha_jihwa,
        ashtavidha_shabda: assessment.ashtavidha_shabda,
        ashtavidha_sparsha: assessment.ashtavidha_sparsha,
        ashtavidha_drik: assessment.ashtavidha_drik,
        ashtavidha_akriti: assessment.ashtavidha_akriti,
        samprapti: assessment.samprapti,
        diagnosis: assessment.diagnosis,
        treatment_plan: assessment.treatment_plan,
        clinical_notes: assessment.clinical_notes,
      };

      const { error } = await supabase
        .from("clinical_assessments")
        .insert([assessmentData]);

      if (error) {
        console.error("ASSESSMENT ERROR:", error);
        setAssessmentMessage("❌ Assessment save नहीं हुआ: " + error.message);
        return;
      }

      setAssessmentMessage("✅ Clinical Assessment सफलतापूर्वक सहेजा गया!");
    } catch (error) {
      console.error(error);
      setAssessmentMessage("❌ Error: " + (error?.message || "Unknown error"));
    } finally {
      setSavingAssessment(false);
    }
  }

  // =========================
  // FILTER PATIENTS
  // =========================
  const searchText = search.toLowerCase().trim();
  const filteredPatients = patients.filter((p) => {
    const patientName = (p.name || "").toLowerCase();
    const patientPhone = (p.phone || "").toString();
    return patientName.includes(searchText) || patientPhone.includes(searchText);
  });

  // =========================
  // HOME SCREEN
  // =========================
  if (screen === "home") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: "#2e7d32" }}>🌿 Tathastu</h1>
        <h2 style={{ fontSize: "20px" }}>आयुर्वेद चिकित्सा सहायक</h2>
        <h3 style={{ fontSize: "16px", color: "#555" }}>वैद्य डेस्क</h3>

        <div style={{ display: "grid", gap: "12px", maxWidth: "420px", marginTop: "20px" }}>
          <button style={{ padding: "12px", fontSize: "15px", cursor: "pointer" }} onClick={() => setScreen("newPatient")}>
            ➕ नया रोगी
          </button>

          <button style={{ padding: "12px", fontSize: "15px", cursor: "pointer" }} onClick={openPatientList}>
            👤 रोगी सूची
          </button>

          <button style={{ padding: "12px", fontSize: "15px", cursor: "pointer" }} onClick={openPatientList}>
            📋 चिकित्सकीय परीक्षण (रोगी चुनें)
          </button>

          <button style={{ padding: "12px", fontSize: "15px", cursor: "pointer" }} onClick={openPatientList}>
            💊 चिकित्सा / Prescription
          </button>

          <button style={{ padding: "12px", fontSize: "15px", cursor: "pointer" }} onClick={() => alert("शीघ्र उपलब्ध होगा")}>
            🔄 अनुवर्तन (Follow-up)
          </button>

          <button style={{ padding: "12px", fontSize: "15px", cursor: "pointer" }} onClick={() => alert("शीघ्र उपलब्ध होगा")}>
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
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer" }} onClick={() => { setMessage(""); setScreen("home"); }}>
          ← वापस
        </button>

        <h2>👤 नया रोगी पंजीकरण</h2>

        <div style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
          <input style={{ padding: "10px" }} placeholder="रोगी का नाम" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={{ padding: "10px" }} placeholder="आयु" type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} />

          <select style={{ padding: "10px" }} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">लिंग चुनें</option>
            <option value="Male">पुरुष</option>
            <option value="Female">महिला</option>
            <option value="Other">अन्य</option>
          </select>

          <input style={{ padding: "10px" }} placeholder="मोबाइल नंबर" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea style={{ padding: "10px" }} placeholder="मुख्य शिकायत" rows="4" value={complaint} onChange={(e) => setComplaint(e.target.value)} />

          <button style={{ padding: "12px", fontWeight: "bold", cursor: "pointer" }} onClick={savePatient} disabled={saving}>
            {saving ? "⏳ सहेजा जा रहा है..." : "💾 रोगी सहेजें"}
          </button>

          {message && (
            <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", fontWeight: "bold", border: "1px solid #ddd" }}>
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
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer" }} onClick={() => setScreen("home")}>
          ← वापस
        </button>

        <h2>👤 पंजीकृत रोगी सूची</h2>

        <input
          type="text"
          placeholder="🔎 नाम या मोबाइल नंबर से खोजें..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "480px", padding: "12px", marginBottom: "16px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        {loadingPatients ? (
          <p>⏳ लोड हो रहा है...</p>
        ) : filteredPatients.length === 0 ? (
          <p>कोई रोगी नहीं मिला।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "480px" }}>
            {filteredPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPatient(p);
                  setScreen("profile");
                }}
                style={{ padding: "14px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" }}
              >
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>👤 {p.name}</div>
                <div style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>
                  आयु: {p.age || "—"} | {p.gender || "—"}
                </div>
                <div style={{ fontSize: "14px", color: "#555" }}>📱 {p.phone || "—"}</div>
                <div style={{ fontSize: "14px", color: "#333", marginTop: "4px" }}>🩺 {p.complaint || "कोई शिकायत नहीं"}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // PATIENT PROFILE SCREEN
  // =========================
  if (screen === "profile" && selectedPatient) {
    const p = selectedPatient;

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer" }} onClick={() => setScreen("patients")}>
          ← रोगी सूची
        </button>

        <h2>👤 रोगी प्रोफाइल</h2>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "18px", maxWidth: "480px", border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>{p.name}</h3>
          <p><strong>आयु:</strong> {p.age || "—"}</p>
          <p><strong>लिंग:</strong> {p.gender || "—"}</p>
          <p><strong>मोबाइल:</strong> {p.phone || "—"}</p>
          <p><strong>मुख्य शिकायत:</strong><br />{p.complaint || "—"}</p>

          <hr style={{ margin: "16px 0" }} />

          <button
            onClick={() => {
              setAssessmentMessage("");
              setScreen("assessment");
            }}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold" }}
          >
            📋 Clinical Assessment (चिकित्सकीय परीक्षण)
          </button>

          <button
            onClick={() => alert("प्रिस्क्रिप्शन मॉड्यूल शीघ्र आ रहा है")}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer" }}
          >
            💊 Prescription
          </button>

          <button
            onClick={() => alert("अनुवर्तन हिस्ट्री शीघ्र आ रही है")}
            style={{ width: "100%", padding: "12px", cursor: "pointer" }}
          >
            🔄 Follow-up History
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // CLINICAL ASSESSMENT SCREEN
  // =========================
  if (screen === "assessment" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>

        <h2>🩺 चिकित्सकीय मूल्यांकन</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "12px", maxWidth: "520px", border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>👤 {selectedPatient.name}</h3>
          <p style={{ color: "#666" }}>आयु: {selectedPatient.age || "—"} | {selectedPatient.gender || "—"}</p>

          <hr style={{ margin: "16px 0" }} />

          <h4 style={{ color: "#2e7d32" }}>🌿 आयुर्वेदिक मूलभूत परीक्षा</h4>
          <AssessmentInput label="नाड़ी" value={assessment.pulse} onChange={(v) => updateAssessment("pulse", v)} />
          <AssessmentInput label="दोष (वात/पित्त/कफ)" value={assessment.dosha} onChange={(v) => updateAssessment("dosha", v)} />
          <AssessmentInput label="धातु" value={assessment.dhatu} onChange={(v) => updateAssessment("dhatu", v)} />
          <AssessmentInput label="मल" value={assessment.mala} onChange={(v) => updateAssessment("mala", v)} />
          <AssessmentInput label="अग्नि (सम/विषम/तीक्ष्ण/मन्द)" value={assessment.agni} onChange={(v) => updateAssessment("agni", v)} />
          <AssessmentInput label="आम (साम/निराम)" value={assessment.ama} onChange={(v) => updateAssessment("ama", v)} />
          <AssessmentInput label="प्रकृति" value={assessment.prakriti} onChange={(v) => updateAssessment("prakriti", v)} />
          <AssessmentInput label="विकृति" value={assessment.vikriti} onChange={(v) => updateAssessment("vikriti", v)} />

          <h4 style={{ color: "#2e7d32", marginTop: "20px" }}>📋 अष्टविध परीक्षा</h4>
          <AssessmentInput label="नाड़ी" value={assessment.ashtavidha_nadi} onChange={(v) => updateAssessment("ashtavidha_nadi", v)} />
          <AssessmentInput label="मूत्र" value={assessment.ashtavidha_mutra} onChange={(v) => updateAssessment("ashtavidha_mutra", v)} />
          <AssessmentInput label="मल" value={assessment.ashtavidha_mala} onChange={(v) => updateAssessment("ashtavidha_mala", v)} />
          <AssessmentInput label="जिह्वा" value={assessment.ashtavidha_jihwa} onChange={(v) => updateAssessment("ashtavidha_jihwa", v)} />
          <AssessmentInput label="शब्द" value={assessment.ashtavidha_shabda} onChange={(v) => updateAssessment("ashtavidha_shabda", v)} />
          <AssessmentInput label="स्पर्श" value={assessment.ashtavidha_sparsha} onChange={(v) => updateAssessment("ashtavidha_sparsha", v)} />
          <AssessmentInput label="दृष्टि" value={assessment.ashtavidha_drik} onChange={(v) => updateAssessment("ashtavidha_drik", v)} />
          <AssessmentInput label="आकृति" value={assessment.ashtavidha_akriti} onChange={(v) => updateAssessment("ashtavidha_akriti", v)} />

          <h4 style={{ color: "#2e7d32", marginTop: "20px" }}>📋 रोग विवरण व निदान</h4>
          <AssessmentInput label="सम्प्राप्ति" value={assessment.samprapti} onChange={(v) => updateAssessment("samprapti", v)} textarea />
          <AssessmentInput label="निदान (Diagnosis)" value={assessment.diagnosis} onChange={(v) => updateAssessment("diagnosis", v)} textarea />
          <AssessmentInput label="चिकित्सा योजना (Treatment Plan)" value={assessment.treatment_plan} onChange={(v) => updateAssessment("treatment_plan", v)} textarea />
          <AssessmentInput label="चिकित्सकीय टिप्पणियाँ (Clinical Notes)" value={assessment.clinical_notes} onChange={(v) => updateAssessment("clinical_notes", v)} textarea />

          <button
            onClick={saveAssessment}
            disabled={savingAssessment}
            style={{ width: "100%", padding: "14px", marginTop: "16px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
          >
            {savingAssessment ? "⏳ सहेजा जा रहा है..." : "💾 Assessment सहेजें"}
          </button>

          {assessmentMessage && (
            <div style={{ marginTop: "12px", padding: "12px", background: "#f0f0f0", borderRadius: "8px", fontWeight: "bold" }}>
              {assessmentMessage}
            </div>
          )}
        </div>
      </main>
    );
  }

  return null;
}
