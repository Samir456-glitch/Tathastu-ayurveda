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

  // Prescription States
  const [medicines, setMedicines] = useState([
    { name: "", dose: "", timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
  ]);
  const [diet, setDiet] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [followUpDays, setFollowUpDays] = useState("7");
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionMsg, setPrescriptionMsg] = useState("");

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
      setName("");
      setAge("");
      setGender("");
      setPhone("");
      setComplaint("");
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
      const assessmentData = {
        patient_id: pId,
        ...assessment
      };

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
      const { error } = await supabase.from("prescriptions").insert([{
        patient_id: selectedPatient.id,
        medicines: medicines,
        diet_instructions: diet,
        lifestyle_advice: lifestyle,
        follow_up_days: followUpDays ? Number(followUpDays) : 7
      }]);

      if (error) throw error;
      setPrescriptionMsg("✅ पर्चा सफलतापूर्वक सहेजा गया!");
    } catch (err) {
      setPrescriptionMsg("❌ एरर: " + err.message);
    } finally {
      setSavingPrescription(false);
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
            onClick={() => { setAssessmentMessage(""); setScreen("assessment"); }}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold" }}
          >
            📋 Clinical Assessment (चिकित्सकीय परीक्षण)
          </button>

          <button
            onClick={() => { setPrescriptionMsg(""); setScreen("prescription"); }}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold", background: "#e8f5e9", border: "1px solid #81c784" }}
          >
            💊 Prescription (चिकित्सा पर्चा)
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
  // 6. PRESCRIPTION SCREEN
  // =========================
  if (screen === "prescription" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer" }} onClick={() => setScreen("profile")}>
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
                placeholder="औषधि नाम (उदा. महासुदर्शन वटी / गिलोय घनवटी)"
                value={m.name}
                onChange={(e) => updateMedicineRow(idx, "name", e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "6px", boxSizing: "border-box" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <input
                  placeholder="मात्रा (उदा. 1-1 वटी / 3g)"
                  value={m.dose}
                  onChange={(e) => updateMedicineRow(idx, "dose", e.target.value)}
                  style={{ padding: "8px", boxSizing: "border-box" }}
                />
                <input
                  placeholder="अनुपान (उदा. कोष्ण जल / शहद)"
                  value={m.anupana}
                  onChange={(e) => updateMedicineRow(idx, "anupana", e.target.value)}
                  style={{ padding: "8px", boxSizing: "border-box" }}
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
            style={{ width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box" }}
          />

          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            🔄 पुनः परीक्षण (Follow-up दिन बाद):
          </label>
          <input
            type="number"
            value={followUpDays}
            onChange={(e) => setFollowUpDays(e.target.value)}
            style={{ width: "100px", padding: "8px", marginBottom: "16px" }}
          />

          <button
            onClick={savePrescription}
            disabled={savingPrescription}
            style={{ width: "100%", padding: "14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
          >
            {savingPrescription ? "⏳ सहेजा जा रहा है..." : "💾 प्रिस्क्रिप्शन सहेजें"}
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

  return null;
}
