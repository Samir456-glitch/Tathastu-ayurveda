"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

// Categorized Ayurvedic Medicine Database
const MEDICINE_CATEGORIES = {
  "वटी / गुटिका": [
    "Chandraprabha Vati", "Arogyavardhini Vati", "Mahasudarshan Vati", "Sanjivani Vati",
    "Khadiradi Vati", "Chitrakadi Vati", "Lashunadi Vati", "Brahmi Vati", "Shankh Vati",
    "Giloy Ghanvati", "Arshoghni Vati", "Shilajitvadi Vati", "Sudershan Ghanvati", "Pramehin"
  ],
  "आसव / अरिष्ट": [
    "Amritarishta", "Ashokarishta", "Ashwagandharishta", "Arvindasava", "Balarishta",
    "Dashmularishta", "Draksharishta", "Kumaryasava", "Lohasava", "Punarnavarishta",
    "Saraswatarishta", "Vidangarishta", "Kanakasava", "Chandanasava"
  ],
  "चूर्ण": [
    "Triphala Churna", "Avipattikar Churna", "Hingwashtak Churna", "Sitopaladi Churna",
    "Talisadi Churna", "Trikatu Churna", "Lavan Bhaskar Churna", "Ashwagandha Churna",
    "Shatavari Churna", "Pushyanug Churna", "Yashtimadhu Churna", "Amlaki Rasayana"
  ],
  "गुग्गुलु / रस / भस्म": [
    "Kaishore Guggulu", "Yograj Guggulu", "Gokshuradi Guggulu", "Triphala Guggulu", "Medohar Guggulu",
    "Madhumeha Kusumakar Ras", "Tribhuvan Kirti Ras", "Kamdudha Ras", "Sootshekhar Ras",
    "Brihat Vata Chintamani Ras", "Godanti Bhasma", "Praval Pishti", "Mukta Shukti Bhasma", "Switran"
  ],
  "क्वाथ / तैल / अन्य": [
    "Maharasnadi Kwath", "Dashmool Kwath", "Mahanarayan Taila", "Ksheerabala Taila", "Jatyadi Taila",
    "Mahabhringraj Taila", "Triphala Ghrita", "Panchatikta Ghrita Guggulu", "Chyawanprash", "Liv.52", "Cystone"
  ]
};

const SEVAN_KAAL_LIST = [
  "भोजन पश्चात (Post-Meal)",
  "भोजन पूर्व (Pre-Meal / प्राग्भक्त)",
  "प्रातः खाली पेट (Empty Stomach)",
  "भोजन मध्य (With Food)",
  "शयनकाल (Bedtime / सोते समय)",
  "दिन में दो बार (BD)",
  "दिन में तीन बार (TDS)",
  "यथावश्यक (SOS)"
];

const ANUPANA_LIST = [
  "कोष्ण जल (Lukewarm Water)",
  "शहद (Honey / मधु)",
  "दुग्ध / गोदुग्ध (Milk)",
  "गोघृत (Cow's Ghee)",
  "तक्र / छाछ (Buttermilk)",
  "ताज़ा जल (Fresh Water)",
  "तुलसी स्वरस (Tulsi Juice)",
  "अदरक स्वरस (Ginger Juice)",
  "दशमूल क्वाथ",
  "पुनर्नवा क्वाथ",
  "बराबर मात्रा में जल"
];

const COMMON_DOSES = [
  "1-1 वटी", "2-2 वटी", "1 वटी दिन में 3 बार",
  "3 ग्राम", "5 ग्राम", "1 चम्मच (5g)",
  "15ml बराबर जल मिलाकर", "20ml बराबर जल मिलाकर", "यथावश्यक"
];

const COMMON_INVESTIGATIONS = [
  "CBC & ESR", "Blood Sugar (F & PP)", "HbA1c", "LFT (Liver Function)", "KFT (Kidney Function)",
  "Lipid Profile", "Urine R/M", "Serum Uric Acid", "Thyroid Profile (T3, T4, TSH)",
  "USG Whole Abdomen", "Chest X-Ray (PA View)", "12-Lead ECG"
];

// Helper functions for Date & Time Formatting
function formatTime(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

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
  const [attendingDoctor, setAttendingDoctor] = useState("वैद्य (ड्यूटी पर)");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("वटी / गुटिका");
  const [medicines, setMedicines] = useState([
    { category: "वटी / गुटिका", name: "", dose: "1-1 वटी", timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
  ]);
  const [investigations, setInvestigations] = useState("");
  const [diet, setDiet] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [followUpDays, setFollowUpDays] = useState("7");
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionMsg, setPrescriptionMsg] = useState("");
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Follow-up States
  const [followUps, setFollowUps] = useState([]);
  const [fuSymptomRelief, setFuSymptomRelief] = useState("50% सुधार");
  const [fuPulse, setFuPulse] = useState("");
  const [fuNewComplaints, setFuNewComplaints] = useState("");
  const [fuTreatmentMod, setFuTreatmentMod] = useState("पूर्वतः औषधि चालू रखें");
  const [fuNextVisit, setFuNextVisit] = useState("7");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState("");

  // =========================
  // SAVE PATIENT (Registration with Timestamp)
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
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from("patients").insert([patient]).select().single();
      if (error) throw error;

      const generatedId = data?.id ? `TAT-${data.id}` : "";
      const regTime = formatTime(data?.created_at || patient.created_at);
      setMessage(`✅ रोगी सहेजा गया! (UHID: ${generatedId} | समय: ${regTime})`);
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
  const addMedicineFromCategory = (medName, catName) => {
    let defaultDose = "1-1 वटी";
    if (catName === "चूर्ण") defaultDose = "3 ग्राम";
    if (catName === "आसव / अरिष्ट") defaultDose = "15ml बराबर जल मिलाकर";
    if (catName === "गुग्गुलु / रस / भस्म") defaultDose = "1-1 वटी";
    if (catName === "क्वाथ / तैल / अन्य") defaultDose = "यथावश्यक";

    setMedicines([
      ...medicines,
      { category: catName, name: medName, dose: defaultDose, timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
    ]);
  };

  const addEmptyMedicineRow = () => {
    setMedicines([
      ...medicines,
      { category: selectedCategoryTab, name: "", dose: "1-1 वटी", timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
    ]);
  };

  const updateMedicineRow = (index, field, val) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const addInvestigationTag = (test) => {
    if (investigations.includes(test)) return;
    setInvestigations(investigations ? `${investigations}, ${test}` : test);
  };

  // Consultation Completion with Timestamp
  async function savePrescription() {
    if (!selectedPatient?.id) return;
    setSavingPrescription(true);
    setPrescriptionMsg("⏳ पर्चा सहेजा जा रहा है...");

    try {
      const nowIso = new Date().toISOString();
      const newRx = {
        patient_id: selectedPatient.id,
        medicines: medicines,
        diet_instructions: diet,
        lifestyle_advice: attendingDoctor,
        follow_up_days: followUpDays ? Number(followUpDays) : 7,
        investigations: investigations,
        created_at: nowIso
      };

      const { data, error } = await supabase.from("prescriptions").insert([newRx]).select().single();
      if (error) throw error;

      setCurrentPrescription(data || newRx);
      setPrescriptionMsg("✅ पर्चा सफलतापूर्वक सहेजा गया!");
      setTimeout(() => setScreen("printPreview"), 600);
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

  // =========================
  // FOLLOW-UP HELPERS
  // =========================
  async function fetchFollowUps() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFollowUps(data || []);
      setScreen("followUpScreen");
    } catch (err) {
      alert("Follow-up डेटा लोड नहीं हुआ: " + err.message);
    }
  }

  async function saveFollowUp() {
    if (!selectedPatient?.id) return;
    setSavingFollowUp(true);
    setFollowUpMsg("⏳ Follow-up सहेजा जा रहा है...");

    try {
      const fuData = {
        patient_id: selectedPatient.id,
        symptom_relief: fuSymptomRelief,
        pulse: fuPulse,
        new_complaints: fuNewComplaints,
        treatment_modification: fuTreatmentMod,
        attending_doctor: attendingDoctor,
        next_visit_days: fuNextVisit ? Number(fuNextVisit) : 7,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from("follow_ups").insert([fuData]);
      if (error) throw error;

      setFollowUpMsg("✅ Follow-up सफलतापूर्वक सहेजा गया!");
      fetchFollowUps();
    } catch (err) {
      setFollowUpMsg("❌ Error: " + err.message);
    } finally {
      setSavingFollowUp(false);
    }
  }

  // =========================
  // DIRECT PDF DOWNLOAD / SHARE
  // =========================
  async function downloadPdfDirect() {
    setDownloadingPdf(true);

    try {
      if (!window.html2pdf) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.body.appendChild(script);
        await new Promise((res) => (script.onload = res));
      }

      const element = document.getElementById("printableArea");
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `${selectedPatient?.name || "Patient"}_TAT-${selectedPatient?.id || "Rx"}_पर्चा.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
      alert("PDF डाउनलोड में समस्या आई, कृपया दुबारा प्रयास करें।");
    } finally {
      setDownloadingPdf(false);
    }
  }

  function shareOnWhatsApp() {
    if (!selectedPatient || !currentPrescription) return;
    const regTime = formatTime(selectedPatient.created_at);
    const consultTime = formatTime(currentPrescription.created_at);

    let text = `🌿 *तथास्तु आयुर्वेद क्लिनिक*\n\n`;
    text += `*रोगी ID (UHID):* TAT-${selectedPatient.id}\n`;
    text += `*रोगी:* ${selectedPatient.name} (${selectedPatient.age || "—"}y / ${selectedPatient.gender || "—"})\n`;
    text += `*दिनांक:* ${formatDate(currentPrescription.created_at)}\n`;
    text += `*आगमन (Entry):* ${regTime} | *परामर्श (Exit):* ${consultTime}\n`;
    text += `*परामर्शक वैद्य:* ${currentPrescription.lifestyle_advice || attendingDoctor}\n\n`;
    text += `📋 *Rx (औषधि निर्देश):*\n`;
    currentPrescription.medicines?.forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}* [${m.category || "औषधि"}]\n   - मात्रा: ${m.dose || "—"} | काल: ${m.timing || "—"}\n   - अनुपान: ${m.anupana || "—"}\n`;
    });
    if (currentPrescription.investigations) {
      text += `\n🔬 *जाँच (Investigations):* ${currentPrescription.investigations}\n`;
    }
    if (currentPrescription.diet_instructions) {
      text += `\n🥗 *पथ्यापथ्य:* ${currentPrescription.diet_instructions}\n`;
    }
    text += `\n🔄 *पुनः परीक्षण:* ${currentPrescription.follow_up_days || 7} दिन बाद`;

    const rawPhone = (selectedPatient.phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      
    window.open(url, "_blank");
  }

  // Filter
  const searchText = search.toLowerCase().trim();
  const filteredPatients = patients.filter((p) => {
    const pName = (p.name || "").toLowerCase();
    const pPhone = (p.phone || "").toString();
    const pId = (p.id || "").toString();
    const formattedId = `tat-${pId}`;
    return pName.includes(searchText) || pPhone.includes(searchText) || pId.includes(searchText) || formattedId.includes(searchText);
  });

  // =========================
  // 1. HOME SCREEN (Tathastu)
  // =========================
  if (screen === "home") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: "#2e7d32", margin: "0 0 8px 0" }}>🌿 Tathastu</h1>
        <h2 style={{ fontSize: "20px", margin: "0 0 4px 0" }}>आयुर्वेद चिकित्सा सहायक</h2>
        <h3 style={{ fontSize: "16px", color: "#666", marginTop: 0 }}>वैद्य डेस्क</h3>

        <div style={{ maxWidth: "420px", marginTop: "16px", marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="🔍 रोगी ID (उदा. TAT-1), नाम या मोबाइल खोजें..."
            onFocus={openPatientList}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #2e7d32", boxSizing: "border-box", background: "#fff", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "grid", gap: "12px", maxWidth: "420px", marginTop: "16px" }}>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={() => setScreen("newPatient")}>
            ➕ नया रोगी
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            👤 रोगी सूची व खोज (UHID / ID)
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            📋 चिकित्सकीय परीक्षण (रोगी चुनें)
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            💊 चिकित्सा / Prescription (रोगी चुनें)
          </button>
          <button style={{ padding: "14px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500" }} onClick={openPatientList}>
            🔄 अनुवर्तन (Follow-up)
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
          <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="मोबाइल नंबर (WhatsApp)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="मुख्य शिकायत" rows="4" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
          <button style={{ padding: "12px", fontWeight: "bold", cursor: "pointer", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px" }} onClick={savePatient} disabled={saving}>
            {saving ? "⏳ सहेजा जा रहा है..." : "💾 रोगी सहेजें (Auto-ID जनरेट होगी)"}
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
        <h2>👤 पंजीकृत रोगी खोज व सूची</h2>
        <input
          type="text"
          placeholder="🔎 रोगी ID (उदा. TAT-1 या 1), नाम, या मोबाइल से खोजें..."
          value={search}
          autoFocus
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "480px", padding: "12px", marginBottom: "16px", boxSizing: "border-box", borderRadius: "8px", border: "2px solid #2e7d32", fontSize: "15px" }}
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
                style={{ padding: "14px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer", position: "relative" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px", color: "#222" }}>👤 {p.name}</div>
                  <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                    ID: TAT-{p.id}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "3px" }}>
                  🕒 आगमन: {formatDate(p.created_at)} ({formatTime(p.created_at)})
                </div>
                <div style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>आयु: {p.age || "—"} | {p.gender || "—"} | 📱 {p.phone || "—"}</div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <span style={{ background: "#2e7d32", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold" }}>
              UHID: TAT-{p.id}
            </span>
          </div>

          <div style={{ background: "#f9f9f9", padding: "8px 10px", borderRadius: "6px", margin: "10px 0", fontSize: "13px", color: "#555" }}>
            <strong>🕒 पंजीकरण समय (Entry Time):</strong> {formatDate(p.created_at)} at {formatTime(p.created_at)}
          </div>

          <p style={{ margin: "6px 0" }}><strong>आयु:</strong> {p.age || "—"} | <strong>लिंग:</strong> {p.gender || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>मोबाइल:</strong> {p.phone || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>मुख्य शिकायत:</strong><br />{p.complaint || "—"}</p>

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
            onClick={fetchFollowUps}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", cursor: "pointer", fontWeight: "bold", background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: "6px" }}
          >
            🔄 अनुवर्तन / Follow-up Tracker
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0 }}>👤 {selectedPatient.name}</h3>
            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>TAT-{selectedPatient.id}</span>
          </div>
          <p style={{ color: "#666", marginTop: "4px" }}>आयु: {selectedPatient.age || "—"} | {selectedPatient.gender || "—"}</p>
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
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>

        <h2>💊 आयुर्वेद चिकित्सा पर्चा (Rx)</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "12px", maxWidth: "600px", border: "1px solid #ddd" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>👤 {selectedPatient.name} ({selectedPatient.age || "—"}y / {selectedPatient.gender || "—"})</h3>
            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>TAT-{selectedPatient.id}</span>
          </div>

          <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            🕒 आगमन समय (Registered): {formatDate(selectedPatient.created_at)} at {formatTime(selectedPatient.created_at)}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>👨‍⚕️ परामर्शक वैद्य (Attending Doctor):</label>
            <input
              value={attendingDoctor}
              onChange={(e) => setAttendingDoctor(e.target.value)}
              placeholder="वैद्य का नाम..."
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <hr style={{ margin: "12px 0" }} />

          {/* Categorized Tabs for Fast Selection */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#2e7d32", marginBottom: "6px" }}>
              📂 कल्प वर्ग चुनें (Quick Medicine Picker):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {Object.keys(MEDICINE_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryTab(cat)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #2e7d32",
                    background: selectedCategoryTab === cat ? "#2e7d32" : "#f1f8e9",
                    color: selectedCategoryTab === cat ? "#fff" : "#2e7d32",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px", background: "#fafafa", padding: "8px", borderRadius: "6px", border: "1px solid #eee", maxHeight: "120px", overflowY: "auto" }}>
              {MEDICINE_CATEGORIES[selectedCategoryTab]?.map((medName, i) => (
                <span
                  key={i}
                  onClick={() => addMedicineFromCategory(medName, selectedCategoryTab)}
                  style={{
                    padding: "4px 8px",
                    background: "#fff",
                    border: "1px solid #b2dfdb",
                    borderRadius: "12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  ➕ {medName}
                </span>
              ))}
            </div>
          </div>

          {/* Active Medicines List */}
          <h4 style={{ color: "#2e7d32", margin: "16px 0 8px 0" }}>🌿 निर्धारित औषधियाँ ({medicines.length})</h4>
          {medicines.map((m, idx) => (
            <div key={idx} style={{ background: "#f9f9f9", padding: "12px", borderRadius: "8px", marginBottom: "10px", border: "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", background: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                  #{idx + 1} {m.category || "औषधि"}
                </span>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                <select
                  value={m.dose}
                  onChange={(e) => updateMedicineRow(idx, "dose", e.target.value)}
                  style={{ padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontSize: "12px" }}
                >
                  <option value="">-- मात्रा (Dose) --</option>
                  {COMMON_DOSES.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>

                <select
                  value={m.timing}
                  onChange={(e) => updateMedicineRow(idx, "timing", e.target.value)}
                  style={{ padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontSize: "12px" }}
                >
                  <option value="">-- सेवन काल (Timing) --</option>
                  {SEVAN_KAAL_LIST.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
              </div>

              <select
                value={m.anupana}
                onChange={(e) => updateMedicineRow(idx, "anupana", e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontSize: "12px" }}
              >
                <option value="">-- अनुपान (Anupana) --</option>
                {ANUPANA_LIST.map((anp, i) => <option key={i} value={anp}>{anp}</option>)}
              </select>
            </div>
          ))}

          <button onClick={addEmptyMedicineRow} style={{ padding: "8px 12px", marginBottom: "16px", cursor: "pointer", background: "#e0e0e0", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px" }}>
            ➕ अन्य खाली पंक्ति जोड़ें
          </button>

          {/* Investigation Section */}
          <h4 style={{ color: "#2e7d32", margin: "14px 0 6px 0" }}>🔬 आवश्यक जाँच (Investigations / Lab Tests)</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
            {COMMON_INVESTIGATIONS.map((test, i) => (
              <span
                key={i}
                onClick={() => addInvestigationTag(test)}
                style={{ padding: "3px 8px", background: "#e1f5fe", border: "1px solid #81d4fa", borderRadius: "10px", fontSize: "11px", cursor: "pointer" }}
              >
                + {test}
              </span>
            ))}
          </div>
          <textarea
            placeholder="जाँच के नाम (उदा. CBC, USG Abdomen, Urine R/M)..."
            rows="2"
            value={investigations}
            onChange={(e) => setInvestigations(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          {/* Diet Instructions */}
          <h4 style={{ color: "#2e7d32", margin: "10px 0 6px 0" }}>🥗 पथ्यापथ्य (आहार-विहार निर्देश)</h4>
          <textarea
            placeholder="पथ्य / अपथ्य निर्देश..."
            rows="2"
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
  // 7. FOLLOW-UP TRACKER SCREEN
  // =========================
  if (screen === "followUpScreen" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>

        <h2>🔄 अनुवर्तन (Follow-up) - {selectedPatient.name} (TAT-{selectedPatient.id})</h2>

        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "550px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#2e7d32" }}>➕ नया Follow-up दर्ज करें</h3>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>📊 लक्षणात्मक सुधार (Symptom Relief):</label>
            <select
              value={fuSymptomRelief}
              onChange={(e) => setFuSymptomRelief(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="कोई विशेष सुधार नहीं (No Change)">कोई विशेष सुधार नहीं (No Change)</option>
              <option value="25% सुधार (Mild Relief)">25% सुधार (Mild Relief)</option>
              <option value="50% सुधार (Moderate Relief)">50% सुधार (Moderate Relief)</option>
              <option value="75% सुधार (Significant Relief)">75% सुधार (Significant Relief)</option>
              <option value="100% पूर्ण स्वास्थ्य लाभ (Complete Cure)">100% पूर्ण स्वास्थ्य लाभ (Complete Cure)</option>
              <option value="लक्षणों में वृद्धि (Aggravated)">लक्षणों में वृद्धि (Aggravated)</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>🩺 वर्तमान नाड़ी व लक्षण स्थिति:</label>
            <input
              value={fuPulse}
              placeholder="उदा. नाड़ी वात-कफज, अग्नि दीप्त..."
              onChange={(e) => setFuPulse(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>⚠️ नवीन शिकायतें / उपद्रव:</label>
            <input
              value={fuNewComplaints}
              placeholder="यदि कोई नई शिकायत हो..."
              onChange={(e) => setFuNewComplaints(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>💊 चिकित्सा परिवर्तन / निर्देश:</label>
            <textarea
              rows="2"
              value={fuTreatmentMod}
              onChange={(e) => setFuTreatmentMod(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>🔄 अगली विज़िट (दिन बाद):</label>
            <input
              type="number"
              value={fuNextVisit}
              onChange={(e) => setFuNextVisit(e.target.value)}
              style={{ width: "100px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <button
            onClick={saveFollowUp}
            disabled={savingFollowUp}
            style={{ width: "100%", padding: "12px", background: "#f57c00", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
          >
            {savingFollowUp ? "⏳ सहेजा जा रहा है..." : "💾 Follow-up सहेजें"}
          </button>

          {followUpMsg && <div style={{ marginTop: "10px", fontWeight: "bold" }}>{followUpMsg}</div>}
        </div>

        <h3 style={{ color: "#333" }}>📜 पूर्व Follow-up इतिहास ({followUps.length})</h3>
        {followUps.length === 0 ? (
          <p>कोई पूर्व Follow-up रिकॉर्ड मौजूद नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "550px" }}>
            {followUps.map((fu, idx) => (
              <div key={fu.id || idx} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#2e7d32" }}>
                  <span>विज़िट #{followUps.length - idx}</span>
                  <span>{formatDate(fu.created_at)} ({formatTime(fu.created_at)})</span>
                </div>
                <div style={{ marginTop: "6px" }}><strong>सुधार:</strong> {fu.symptom_relief}</div>
                {fu.pulse && <div><strong>नाड़ी/स्थिति:</strong> {fu.pulse}</div>}
                {fu.new_complaints && <div><strong>नई शिकायत:</strong> {fu.new_complaints}</div>}
                <div><strong>निर्देश:</strong> {fu.treatment_modification}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>परामर्शक वैद्य: {fu.attending_doctor || "—"} | अगली विज़िट: {fu.next_visit_days} दिन बाद</div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 8. SAVED PRESCRIPTION LIST SCREEN
  // =========================
  if (screen === "prescriptionList" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>
        <h2>📜 सहेजे गए पर्चे ({selectedPatient.name} - TAT-{selectedPatient.id})</h2>

        {savedPrescriptions.length === 0 ? (
          <p>कोई पुराना पर्चा नहीं मिला।</p>
        ) : (
          <div style={{ display: "grid", gap: "12px", maxWidth: "500px" }}>
            {savedPrescriptions.map((rx, idx) => (
              <div key={rx.id || idx} style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>दिनांक: {formatDate(rx.created_at)}</strong>
                  <span style={{ fontSize: "12px", color: "#666" }}>🕒 {formatTime(rx.created_at)}</span>
                </div>
                <div style={{ marginTop: "4px" }}><strong>परामर्शक वैद्य:</strong> {rx.lifestyle_advice || "वैद्य डेस्क"}</div>
                <div><strong>औषधियाँ:</strong> {rx.medicines?.length || 0} आइटम्स</div>
                {rx.investigations && <div style={{ fontSize: "13px", color: "#555" }}><strong>जाँच:</strong> {rx.investigations}</div>}
                <button
                  onClick={() => { setCurrentPrescription(rx); setScreen("printPreview"); }}
                  style={{ marginTop: "10px", padding: "8px 14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  👁️ पर्चा देखें / डाउनलोड करें
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 9. PRINT / PDF PREVIEW SCREEN (With Entry & Exit Timestamps)
  // =========================
  if (screen === "printPreview" && selectedPatient && currentPrescription) {
    const rx = currentPrescription;
    const entryDateStr = formatDate(selectedPatient.created_at);
    const entryTimeStr = formatTime(selectedPatient.created_at);
    const exitTimeStr = formatTime(rx.created_at);
    const consultDateStr = formatDate(rx.created_at);

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif", maxWidth: "700px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", marginBottom: "16px" }}>
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
            ← वापस
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={shareOnWhatsApp}
              style={{ padding: "10px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              💬 WhatsApp ({selectedPatient.phone || "Share"})
            </button>
            <button
              onClick={downloadPdfDirect}
              disabled={downloadingPdf}
              style={{ padding: "10px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              {downloadingPdf ? "⏳ PDF बन रही है..." : "📥 PDF Download"}
            </button>
          </div>
        </div>

        {/* Prescription Letterhead with Both Timestamps */}
        <div id="printableArea" style={{ border: "2px solid #2e7d32", padding: "20px", borderRadius: "10px", background: "#fff" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #2e7d32", paddingBottom: "10px", marginBottom: "14px" }}>
            <h1 style={{ margin: "0", color: "#2e7d32", fontSize: "24px" }}>🌿 तथास्तु आयुर्वेद क्लिनिक</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#555" }}>विशेष आयुर्वेद चिकित्सा एवं परामर्श केंद्र</p>
          </div>

          {/* Patient Details & Exact Timestamps */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.1fr", gap: "8px", fontSize: "12px", marginBottom: "14px", background: "#f4f9f4", padding: "8px 10px", borderRadius: "6px", border: "1px solid #c8e6c9" }}>
            <div>
              <strong>रोगी:</strong> {selectedPatient.name}<br />
              <span style={{ color: "#2e7d32", fontWeight: "bold" }}>UHID: TAT-{selectedPatient.id}</span>
            </div>
            <div>
              <strong>आयु/लिंग:</strong> {selectedPatient.age || "—"}y / {selectedPatient.gender || "—"}<br />
              <strong>मोबाइल:</strong> {selectedPatient.phone || "—"}
            </div>
            <div style={{ textAlign: "right" }}>
              <div><strong>दिनांक:</strong> {consultDateStr}</div>
              <div style={{ color: "#444" }}><strong>आगमन (Entry):</strong> {entryTimeStr}</div>
              <div style={{ color: "#2e7d32", fontWeight: "bold" }}><strong>निकास (Exit):</strong> {exitTimeStr}</div>
            </div>
          </div>

          <h3 style={{ color: "#2e7d32", borderBottom: "1px solid #2e7d32", paddingBottom: "4px", margin: "10px 0 8px 0", fontSize: "16px" }}>Rx (औषधि निर्देश)</h3>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "14px" }}>
            <thead>
              <tr style={{ background: "#e8f5e9", color: "#1b5e20", textAlign: "left" }}>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "24px", textAlign: "center" }}>#</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9" }}>औषधि नाम (कल्पना)</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "90px" }}>मात्रा</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "120px" }}>सेवन काल</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "120px" }}>अनुपान</th>
              </tr>
            </thead>
            <tbody>
              {rx.medicines?.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px", border: "1px solid #ddd", textAlign: "center" }}>{i + 1}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>
                    <strong>{m.name}</strong>
                    {m.category && <span style={{ display: "block", fontSize: "10px", color: "#666" }}>[{m.category}]</span>}
                  </td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.dose || "—"}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.timing || "—"}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.anupana || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Investigations in Rx */}
          {rx.investigations && (
            <div style={{ marginTop: "10px", marginBottom: "12px" }}>
              <strong style={{ color: "#0277bd", fontSize: "13px" }}>🔬 आवश्यक जाँच (Investigations):</strong>
              <div style={{ background: "#e1f5fe", padding: "6px 10px", borderRadius: "4px", border: "1px solid #b3e5fc", margin: "4px 0", fontSize: "12px", color: "#01579b" }}>
                {rx.investigations}
              </div>
            </div>
          )}

          {/* Diet Instructions */}
          {rx.diet_instructions && (
            <div style={{ marginTop: "10px", marginBottom: "14px" }}>
              <strong style={{ color: "#2e7d32", fontSize: "13px" }}>🥗 पथ्यापथ्य निर्देश:</strong>
              <div style={{ background: "#fafafa", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e0e0e0", margin: "4px 0", fontSize: "12px", color: "#333" }}>
                {rx.diet_instructions}
              </div>
            </div>
          )}

          {/* Footer with Duty Vaidya & Sign */}
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "13px" }}>
            <div>
              <strong>🔄 पुनः परीक्षण:</strong> 
              <span style={{ marginLeft: "4px", color: "#2e7d32", fontWeight: "bold" }}>
                {rx.follow_up_days || 7} दिन बाद
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#555", fontSize: "12px", marginBottom: "2px" }}>
                {rx.lifestyle_advice || attendingDoctor}
              </div>
              <div style={{ borderTop: "1px dashed #444", width: "140px", paddingTop: "4px", fontWeight: "bold" }}>
                हस्ताक्षर (वैद्य)
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }

  return null;
}
