"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

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
    pulse: "", dosha: "", dhatu: "", mala: "", agni: "", ama: "", prakriti: "", vikriti: "",
    ashtavidha_nadi: "", ashtavidha_mutra: "", ashtavidha_mala: "", ashtavidha_jihwa: "",
    ashtavidha_shabda: "", ashtavidha_sparsha: "", ashtavidha_drik: "", ashtavidha_akriti: "",
    samprapti: "", diagnosis: "", treatment_plan: "", clinical_notes: "",
  });
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");

  // Prescription States
  const [medicines, setMedicines] = useState([
    { name: "", dose: "", timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
  ]);
  const [diet, setDiet] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [followUpDays, setFollowUpDays] = useState("7");
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionMsg, setPrescriptionMsg] = useState("");
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [currentPrescription, setCurrentPrescription] = useState(null);

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

      const { error } = await supabase.from("patients").insert([patient]);
      if (error) throw error;

      setMessage("✅ रोगी सफलतापूर्वक सहेजा गया!");
      setName(""); setAge(""); setGender(""); setPhone(""); setComplaint("");
    } catch (error) {
      setMessage("❌ Save Error: " + (error?.message || "Failed"));
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

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      alert("रोगी सूची लोड नहीं हुई: " + error.message);
    } finally {
      setLoadingPatients(false);
    }
  }

  function openPatientList() {
    setSearch("");
    setSelectedPatient(null);
    setScreen("patients");
    fetchPatients();
  }

  function updateAssessment(field, value) {
    setAssessment((prev) => ({ ...prev, [field]: value }));
  }

  // =========================
  // SAVE ASSESSMENT
  // =========================
  async function saveAssessment() {
    const pId = selectedPatient?.id;
    if (!pId) {
      setAssessmentMessage("❌ रोगी का चयन नहीं हुआ है।");
      return;
    }

    setSavingAssessment(true);
    setAssessmentMessage("⏳ Assessment सहेजा जा रहा है...");

    try {
      const assessmentData = { patient_id: pId, ...assessment };
      const { error } = await supabase.from("clinical_assessments").insert([assessmentData]);
      if (error) throw error;
      setAssessmentMessage("✅ Clinical Assessment सफलतापूर्वक सहेजा गया!");
    } catch (error) {
      setAssessmentMessage("❌ Error: " + error.message);
    } finally {
      setSavingAssessment(false);
    }
  }

  // =========================
  // PRESCRIPTION HELPERS
  // =========================
  const addMedicineRow = () => {
    setMedicines([...medicines, { name: "", dose: "", timing: "भोजन पश्चात", anupana: "कोष्ण जल" }]);
  };

  const updateMedicineRow = (index, field, val) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  async function savePrescription() {
    if (!selectedPatient?.id) return;
    setSavingPrescription(true);
    setPrescriptionMsg("⏳ पर्चा सहेजा जा रहा है...");

    try {
      const newRx = {
        patient_id: selectedPatient.id,
        medicines: medicines,
        diet_instructions: diet,
        lifestyle_advice: lifestyle,
        follow_up_days: followUpDays ? Number(followUpDays) : 7,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from("prescriptions").insert([newRx]).select().single();
      if (error) throw error;

      setCurrentPrescription(data || newRx);
      setPrescriptionMsg("✅ पर्चा सफलतापूर्वक सहेजा गया!");
      setTimeout(() => setScreen("printPreview"), 800);
    } catch (err) {
      setPrescriptionMsg("❌ एरर: " + err.message);
    } finally {
      setSavingPrescription(false);
    }
  }

  async function fetchPatientPrescriptions() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPrescriptions(data || []);
      setScreen("prescriptionList");
    } catch (err) {
      alert("पर्चा लोड करने में समस्या: " + err.message);
    }
  }

  // Filter
  const searchText = search.toLowerCase().trim();
  const filteredPatients = patients.filter((p) => {
    const pName = (p.name || "").toLowerCase();
    const pPhone = (p.phone || "").toString();
    return pName.includes(searchText) || pPhone.includes(searchText);
  });

  // =========================
  // 1. HOME SCREEN
  // =========================
  if (screen === "home") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: "#2e7d32", margin: "0 0 8px 0" }}>🌿 Tathastu</h1>
        <h2 style={{ fontSize: "20px", margin: "0 0 4px 0" }}>आयुर्वेद चिकित्सा सहायक</h2>
        <h3 style={{ fontSize: "16px", color: "#666", marginTop: 0 }}>वैद्य डेस्क</h3>

        <div style={{ display: "grid", gap: "12px", maxWidth: "420px", marginTop: "24px" }}>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={() => setScreen("newPatient")}>
            ➕ नया रोगी
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            👤 रोगी सूची
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            📋 चिकित्सकीय परीक्षण (रोगी चुनें)
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            💊 चिकित्सा / Prescription (रोगी चुनें)
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // 2. NEW PATIENT SCREEN
  // =========================
  if (screen === "newPatient") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => { setMessage(""); setScreen("home"); }}>
          ← वापस
        </button>
        <h2>👤 नया रोगी पंजीकरण</h2>
        <div style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
          <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="रोगी का नाम" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="आयु" type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} />
          <select style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">लिंग चुनें</option>
            <option value="Male">पुरुष</option>
            <option value="Female">महिला</option>
            <option value="Other">अन्य</option>
          </select>
          <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="मोबाइल नंबर" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="मुख्य शिकायत" rows="4" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
          <button style={{ padding: "12px", fontWeight: "bold", cursor: "pointer", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px" }} onClick={savePatient} disabled={saving}>
            {saving ? "⏳ सहेजा जा रहा है..." : "💾 रोगी सहेजें"}
          </button>
          {message && <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", fontWeight: "bold", border: "1px solid #ddd" }}>{message}</div>}
        </div>
      </main>
    );
  }

  // =========================
  // 3. PATIENT LIST SCREEN
  // =========================
  if (screen === "patients") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("home")}>
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
                onClick={() => { setSelectedPatient(p); setScreen("profile"); }}
                style={{ padding: "14px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" }}
              >
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>👤 {p.name}</div>
                <div style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>आयु: {p.age || "—"} | {p.gender || "—"}</div>
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
  // 4. PATIENT PROFILE SCREEN
  // =========================
  if (screen === "profile" && selectedPatient) {
    const p = selectedPatient;
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("patients")}>
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
            onClick={() => { setAssessmentMessage(""); setScreen("assessment"); }}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}
          >
            📋 Clinical Assessment (चिकित्सकीय परीक्षण)
          </button>

          <button
            onClick={() => { setPrescriptionMsg(""); setScreen("prescription"); }}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold", background: "#e8f5e9", border: "1px solid #81c784", borderRadius: "6px" }}
          >
            💊 नया Prescription (पर्चा बनाएँ)
          </button>

          <button
            onClick={fetchPatientPrescriptions}
            style={{ width: "100%", padding: "12px", cursor: "pointer", fontWeight: "bold", background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "6px" }}
          >
            📜 सहेजे गए पर्चे देखें / Print करें
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // 5. CLINICAL ASSESSMENT SCREEN
  // =========================
  if (screen === "assessment" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
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
          <AssessmentInput label="चिकित्सा योजना" value={assessment.treatment_plan} onChange={(v) => updateAssessment("treatment_plan", v)} textarea />
          <AssessmentInput label="चिकित्सकीय टिप्पणियाँ" value={assessment.clinical_notes} onChange={(v) => updateAssessment("clinical_notes", v)} textarea />

          <button
            onClick={saveAssessment}
            disabled={savingAssessment}
            style={{ width: "100%", padding: "14px", marginTop: "16px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
          >
            {savingAssessment ? "⏳ सहेजा जा रहा है..." : "💾 Assessment सहेजें"}
          </button>

          {assessmentMessage && <div style={{ marginTop: "12px", padding: "12px", background: "#f0f0f0", borderRadius: "8px", fontWeight: "bold" }}>{assessmentMessage}</div>}
        </div>
      </main>
    );
  }

  // =========================
  // 6. PRESCRIPTION CREATE SCREEN
  // =========================
  if (screen === "prescription" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>

        <h2>💊 आयुर्वेद चिकित्सा पर्चा (Rx)</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "12px", maxWidth: "550px", border: "1px solid #ddd" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>👤 {selectedPatient.name} ({selectedPatient.age || "—"} वर्ष | {selectedPatient.gender || "—"})</h3>
          <hr style={{ margin: "12px 0" }} />

          <h4 style={{ color: "#2e7d32", marginBottom: "8px" }}>🌿 औषधियाँ (Medicines)</h4>
          {medicines.map((m, idx) => (
            <div key={idx} style={{ background: "#f9f9f9", padding: "12px", borderRadius: "8px", marginBottom: "10px", border: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <strong>औषधि #{idx + 1}</strong>
                {medicines.length > 1 && (
                  <button onClick={() => removeMedicineRow(idx)} style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>✕ हटाएं</button>
                )}
              </div>
              <input
                placeholder="औषधि नाम (उदा. महासुदर्शन वटी)"
                value={m.name}
                onChange={(e) => updateMedicineRow(idx, "name", e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "6px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <input
                  placeholder="मात्रा (उदा. 1-1 वटी / 3g)"
                  value={m.dose}
                  onChange={(e) => updateMedicineRow(idx, "dose", e.target.value)}
                  style={{ padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <input
                  placeholder="अनुपान (उदा. कोष्ण जल / शहद)"
                  value={m.anupana}
                  onChange={(e) => updateMedicineRow(idx, "anupana", e.target.value)}
                  style={{ padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            </div>
          ))}

          <button onClick={addMedicineRow} style={{ padding: "8px 12px", marginBottom: "16px", cursor: "pointer", background: "#e0e0e0", border: "1px solid #ccc", borderRadius: "6px" }}>
            ➕ अन्य औषधि जोड़ें
          </button>

          <h4 style={{ color: "#2e7d32", marginTop: "10px" }}>🥗 पथ्यापथ्य (आहार-विहार निर्देश)</h4>
          <textarea
            placeholder="पथ्य / अपथ्य निर्देश..."
            rows="3"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            🔄 पुनः परीक्षण (Follow-up दिन बाद):
          </label>
          <input
            type="number"
            value={followUpDays}
            onChange={(e) => setFollowUpDays(e.target.value)}
            style={{ width: "100px", padding: "8px", marginBottom: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          <button
            onClick={savePrescription}
            disabled={savingPrescription}
            style={{ width: "100%", padding: "14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
          >
            {savingPrescription ? "⏳ सहेजा जा रहा है..." : "💾 प्रिस्क्रिप्शन सहेजें व देखें"}
          </button>

          {prescriptionMsg && (
            <div style={{ marginTop: "12px", padding: "10px", background: "#f0f0f0", borderRadius: "8px", fontWeight: "bold" }}>
              {prescriptionMsg}
            </div>
          )}
        </div>
      </main>
    );
  }

  // =========================
  // 7. SAVED PRESCRIPTION LIST SCREEN
  // =========================
  if (screen === "prescriptionList" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>
        <h2>📜 सहेजे गए पर्चे ({selectedPatient.name})</h2>

        {savedPrescriptions.length === 0 ? (
          <p>कोई पुराना पर्चा नहीं मिला।</p>
        ) : (
          <div style={{ display: "grid", gap: "12px", maxWidth: "500px" }}>
            {savedPrescriptions.map((rx, idx) => (
              <div key={rx.id || idx} style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <div><strong>दिनांक:</strong> {new Date(rx.created_at).toLocaleDateString()}</div>
                <div><strong>औषधियाँ:</strong> {rx.medicines?.length || 0} आइटम्स</div>
                <button
                  onClick={() => { setCurrentPrescription(rx); setScreen("printPreview"); }}
                  style={{ marginTop: "10px", padding: "8px 14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  👁️ पर्चा देखें / Print करें
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 8. PRINT / PDF PREVIEW SCREEN
  // =========================
  if (screen === "printPreview" && selectedPatient && currentPrescription) {
    const rx = currentPrescription;
    return (
      <main style={{ minHeight: "100vh", background: "#fff", padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }} className="no-print">
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
            ← वापस
          </button>
          <button style={{ padding: "10px 20px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} onClick={() => window.print()}>
            🖨️ Print / PDF करें
          </button>
        </div>

        {/* Prescription Letterhead */}
        <div style={{ border: "2px solid #2e7d32", padding: "20px", borderRadius: "8px" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #2e7d32", paddingBottom: "10px", marginBottom: "15px" }}>
            <h2 style={{ margin: "0", color: "#2e7d32" }}>🌿 ततस्तु आयुर्वेद क्लिनिक</h2>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>विशेष आयुर्वेद चिकित्सा एवं परामर्श केंद्र</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px", background: "#f9f9f9", padding: "8px", borderRadius: "6px" }}>
            <div><strong>रोगी नाम:</strong> {selectedPatient.name}</div>
            <div><strong>आयु/लिंग:</strong> {selectedPatient.age || "—"} वर्ष / {selectedPatient.gender || "—"}</div>
            <div><strong>दिनांक:</strong> {new Date(rx.created_at || Date.now()).toLocaleDateString()}</div>
          </div>

          <h3 style={{ color: "#2e7d32", borderBottom: "1px solid #ddd", paddingBottom: "4px", marginTop: "15px" }}>Rx (औषधि निर्देश)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#e8f5e9", textAlign: "left" }}>
                <th style={{ padding: "6px", border: "1px solid #ddd" }}>क्र.</th>
                <th style={{ padding: "6px", border: "1px solid #ddd" }}>औषधि नाम</th>
                <th style={{ padding: "6px", border: "1px solid #ddd" }}>मात्रा</th>
                <th style={{ padding: "6px", border: "1px solid #ddd" }}>अनुपान</th>
              </tr>
            </thead>
            <tbody>
              {rx.medicines?.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{i + 1}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}><strong>{m.name}</strong></td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.dose}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.anupana}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {rx.diet_instructions && (
            <div style={{ marginTop: "15px" }}>
              <strong>🥗 पथ्यापथ्य निर्देश:</strong>
              <p style={{ background: "#fafafa", padding: "8px", borderRadius: "4px", border: "1px solid #eee", margin: "4px 0" }}>{rx.diet_instructions}</p>
            </div>
          )}

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <div><strong>पुनः परीक्षण (Follow-up):</strong> {rx.follow_up_days || 7} दिन बाद</div>
            <div style={{ textAlign: "right", marginTop: "30px" }}>
              <div style={{ borderTop: "1px solid #333", width: "150px", paddingTop: "4px" }}>वैद्य के हस्ताक्षर</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
