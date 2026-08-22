"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Default Master Presets (Fallbacks)
const DEFAULT_CATEGORIES = {
  "वटी / गुटिका": ["Chandraprabha Vati", "Arogyavardhini Vati", "Mahasudarshan Vati", "Sanjivani Vati", "Khadiradi Vati", "Chitrakadi Vati", "Lashunadi Vati", "Brahmi Vati", "Shankh Vati", "Giloy Ghanvati", "Pramehin"],
  "आसव / अरिष्ट": ["Amritarishta", "Ashokarishta", "Ashwagandharishta", "Arvindasava", "Balarishta", "Dashmularishta", "Draksharishta", "Kumaryasava", "Lohasava", "Punarnavarishta"],
  "चूर्ण": ["Triphala Churna", "Avipattikar Churna", "Hingwashtak Churna", "Sitopaladi Churna", "Talisadi Churna", "Trikatu Churna", "Lavan Bhaskar Churna", "Ashwagandha Churna", "Shatavari Churna"],
  "गुग्गुलु / रस / भस्म": ["Kaishore Guggulu", "Yograj Guggulu", "Gokshuradi Guggulu", "Triphala Guggulu", "Medohar Guggulu", "Madhumeha Kusumakar Ras", "Tribhuvan Kirti Ras", "Kamdudha Ras", "Sootshekhar Ras", "Godanti Bhasma", "Switran"],
  "क्वाथ / तैल / अन्य": ["Maharasnadi Kwath", "Dashmool Kwath", "Mahanarayan Taila", "Ksheerabala Taila", "Jatyadi Taila", "Triphala Ghrita", "Liv.52", "Cystone"]
};

const DEFAULT_SEVAN_KAAL = ["भोजन पश्चात (Post-Meal)", "भोजन पूर्व (Pre-Meal / प्राग्भक्त)", "प्रातः खाली पेट (Empty Stomach)", "भोजन मध्य (With Food)", "शयनकाल (Bedtime)", "दिन में दो बार (BD)", "दिन में तीन बार (TDS)", "यथावश्यक (SOS)"];
const DEFAULT_ANUPANA = ["कोष्ण जल (Lukewarm Water)", "शहद (Honey / मधु)", "दुग्ध / गोदुग्ध (Milk)", "गोघृत (Cow's Ghee)", "तक्र / छाछ (Buttermilk)", "ताज़ा जल (Fresh Water)", "तुलसी स्वरस", "अदरक स्वरस", "दशमूल क्वाथ", "पुनर्नवा क्वाथ", "बराबर मात्रा में जल"];
const DEFAULT_DOSES = ["1-1 वटी", "2-2 वटी", "1 वटी दिन में 3 बार", "3 ग्राम", "5 ग्राम", "1 चम्मच (5g)", "15ml बराबर जल मिलाकर", "20ml बराबर जल मिलाकर", "यथावश्यक"];
const DEFAULT_INVESTIGATIONS = ["CBC & ESR", "Blood Sugar (F & PP)", "HbA1c", "LFT (Liver Function)", "KFT (Kidney Function)", "Lipid Profile", "Urine R/M", "Serum Uric Acid", "Thyroid Profile (T3, T4, TSH)", "USG Whole Abdomen", "Chest X-Ray (PA View)", "12-Lead ECG"];

const DEFAULT_DOCTOR_SUGGESTIONS = [
  "Dr. Sumer Kumar Sharma (BAMS)",
  "Dr. Anshuman Mishra (BAMS)",
  "Dr. Prashant Rai (BAMS)",
  "Dr. Mohit Kumar (BAMS)"
];

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
      <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>{label}</label>
      {textarea ? (
        <textarea rows="3" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
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
  const [opdFilter, setOpdFilter] = useState("All");

  // Dynamic Lists State
  const [anupanaList, setAnupanaList] = useState(DEFAULT_ANUPANA);
  const [doseList, setDoseList] = useState(DEFAULT_DOSES);
  const [investigationList, setInvestigationList] = useState(DEFAULT_INVESTIGATIONS);
  const [doctorSuggestions, setDoctorSuggestions] = useState(DEFAULT_DOCTOR_SUGGESTIONS);
  const [medicineCategories, setMedicineCategories] = useState(DEFAULT_CATEGORIES);

  // Master Management State
  const [masterType, setMasterType] = useState("doctor");
  const [newMasterVal, setNewMasterVal] = useState("");
  const [newMasterCategory, setNewMasterCategory] = useState("वटी / गुटिका");

  // Hospital Settings State
  const [hospitalInfo, setHospitalInfo] = useState({
    hospital_name: "तथास्तु आयुर्वेद क्लिनिक व अनुसंधान केंद्र",
    tagline: "विशेष आयुर्वेद चिकित्सा, पंचकर्म एवं परामर्श केंद्र",
    address: "मुख्य मार्ग, निकट सदर अस्पताल",
    contact_phone: "+91 9876543210",
    doctor_name: "Dr. Sumer Kumar Sharma",
    doctor_qualification: "BAMS (KSDSU), CCAM",
    reg_number: "Reg. No: 4810 (BSCAUM)"
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // New patient
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [complaint, setComplaint] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Edit Patient State
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editComplaint, setEditComplaint] = useState("");
  const [editingPatient, setEditingPatient] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // Clinical Assessment
  const [assessment, setAssessment] = useState({
    pulse: "", dosha: "", dhatu: "", mala: "", agni: "", ama: "", prakriti: "", vikriti: "",
    ashtavidha_nadi: "", ashtavidha_mutra: "", ashtavidha_mala: "", ashtavidha_jihwa: "",
    ashtavidha_shabda: "", ashtavidha_sparsha: "", ashtavidha_drik: "", ashtavidha_akriti: "",
    samprapti: "", diagnosis: "", treatment_plan: "", clinical_notes: ""
  });
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");

  // Prescription States
  const [attendingDoctor, setAttendingDoctor] = useState("Dr. Sumer Kumar Sharma (BAMS)");
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
  const [fuPhone, setFuPhone] = useState("");
  const [fuSymptomRelief, setFuSymptomRelief] = useState("50% सुधार");
  const [fuPulse, setFuPulse] = useState("");
  const [fuNewComplaints, setFuNewComplaints] = useState("");
  const [fuTreatmentMod, setFuTreatmentMod] = useState("पूर्वतः औषधि चालू रखें");
  const [fuNextVisit, setFuNextVisit] = useState("7");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState("");
  const [lastSavedFu, setLastSavedFu] = useState(null);
  const [showSendPrompt, setShowSendPrompt] = useState(false);

  // Billing States
  const [consultFee, setConsultFee] = useState("200");
  const [medFee, setMedFee] = useState("0");
  const [procedureFee, setProcedureFee] = useState("0");
  const [discountFee, setDiscountFee] = useState("0");
  const [payMode, setPayMode] = useState("Cash (नकद)");
  const [billNotes, setBillNotes] = useState("");
  const [savingBill, setSavingBill] = useState(false);
  const [billMsg, setBillMsg] = useState("");
  const [billsList, setBillsList] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);

  // Inventory States
  const [inventoryList, setInventoryList] = useState([]);
  const [invMedName, setInvMedName] = useState("");
  const [invCategory, setInvCategory] = useState("वटी / गुटिका");
  const [invQty, setInvQty] = useState("");
  const [invUnit, setInvUnit] = useState("Vati (Tablets)");
  const [savingInv, setSavingInv] = useState(false);

  // Patient Documents State
  const [patientDocs, setPatientDocs] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("Lab Report (रक्त/मूत्र जाँच)");
  const [newDocNotes, setNewDocNotes] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState({ todayCount: 0, waitingCount: 0, completedCount: 0, todayRevenue: 0 });

  useEffect(() => {
    loadHospitalSettings();
    loadMasterPresets();
    fetchStats();
  }, []);

  async function loadHospitalSettings() {
    try {
      const { data } = await supabase.from("hospital_settings").select("*").eq("id", 1).single();
      if (data) {
        setHospitalInfo(data);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function loadMasterPresets() {
    try {
      const { data } = await supabase.from("master_presets").select("*");
      const meds = { ...DEFAULT_CATEGORIES };
      const anp = [...DEFAULT_ANUPANA];
      const doses = [...DEFAULT_DOSES];
      const invs = [...DEFAULT_INVESTIGATIONS];
      const docs = [...DEFAULT_DOCTOR_SUGGESTIONS];

      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.preset_type === "medicine") {
            const cat = item.category || "अन्य";
            if (!meds[cat]) meds[cat] = [];
            if (!meds[cat].includes(item.preset_value)) meds[cat].push(item.preset_value);
          } else if (item.preset_type === "anupana" && !anp.includes(item.preset_value)) {
            anp.push(item.preset_value);
          } else if (item.preset_type === "dose" && !doses.includes(item.preset_value)) {
            doses.push(item.preset_value);
          } else if (item.preset_type === "investigation" && !invs.includes(item.preset_value)) {
            invs.push(item.preset_value);
          } else if (item.preset_type === "doctor" && !docs.includes(item.preset_value)) {
            docs.push(item.preset_value);
          }
        });
      }

      setMedicineCategories(meds);
      setAnupanaList(anp);
      setDoseList(doses);
      setInvestigationList(invs);
      setDoctorSuggestions(docs);
    } catch (e) {
      console.log(e);
    }
  }

  async function addMasterPreset() {
    if (!newMasterVal.trim()) return;
    try {
      await supabase.from("master_presets").insert([{
        preset_type: masterType,
        preset_value: newMasterVal.trim(),
        category: newMasterCategory
      }]);
      setNewMasterVal("");
      loadMasterPresets();
      alert("✅ नया विकल्प सफलतापूर्वक जुड़ गया!");
    } catch (e) {
      alert("त्रुटि: " + e.message);
    }
  }

  async function saveHospitalSettings() {
    setSavingSettings(true);
    setSettingsMsg("⏳ सेटिंग्स सहेजी जा रही हैं...");
    try {
      const { error } = await supabase.from("hospital_settings").upsert({ id: 1, ...hospitalInfo });
      if (error) throw error;
      setSettingsMsg("✅ हॉस्पिटल विवरण सफलतापूर्वक अपडेट हो गया!");
      setTimeout(() => setSettingsMsg(""), 2500);
    } catch (e) {
      setSettingsMsg("❌ Error: " + e.message);
    } finally {
      setSavingSettings(false);
    }
  }

  async function fetchStats() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todPatients } = await supabase.from("patients").select("opd_status").gte("created_at", todayStart.toISOString());
      const { data: billData } = await supabase.from("billings").select("total_amount").gte("created_at", todayStart.toISOString());

      const todList = todPatients || [];
      const waiting = todList.filter((p) => (p.opd_status || "Waiting") === "Waiting").length;
      const completed = todList.filter((p) => p.opd_status === "Completed").length;
      const todRev = (billData || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

      setStats({ todayCount: todList.length, waitingCount: waiting, completedCount: completed, todayRevenue: todRev });
    } catch (e) {
      console.log(e);
    }
  }

  // Backup Data to CSV
  async function exportPatientsCSV() {
    try {
      const { data } = await supabase.from("patients").select("*").order("id", { ascending: true });
      if (!data || data.length === 0) return alert("कोई डेटा उपलब्ध नहीं है");
      let csvContent = "data:text/csv;charset=utf-8,ID,UHID,Name,Age,Gender,Phone,Complaint,Date,Status\n";
      data.forEach((p) => {
        csvContent += `${p.id},TAT-${p.id},"${p.name || ""}",${p.age || ""},${p.gender || ""},"${p.phone || ""}","${(p.complaint || "").replace(/"/g, '""')}","${formatDate(p.created_at)}",${p.opd_status || ""}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Tathastu_OPD_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("बैकअप डाउनलोड में त्रुटि: " + e.message);
    }
  }

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
        opd_status: "Waiting",
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from("patients").insert([patient]).select().single();
      if (error) throw error;
      const generatedId = data?.id ? `TAT-${data.id}` : "";
      const regTime = formatTime(data?.created_at || patient.created_at);
      setMessage(`✅ रोगी टोकन जारी! (UHID: ${generatedId} | समय: ${regTime})`);
      setName(""); setAge(""); setGender(""); setPhone(""); setComplaint("");
      fetchStats();
    } catch (error) {
      setMessage("❌ Save Error: " + (error?.message || "Failed"));
    } finally {
      setSaving(false);
    }
  }

  async function updatePatientOpdStatus(pId, newStatus) {
    try {
      await supabase.from("patients").update({ opd_status: newStatus }).eq("id", pId);
      if (selectedPatient && selectedPatient.id === pId) {
        setSelectedPatient({ ...selectedPatient, opd_status: newStatus });
      }
      fetchPatients();
      fetchStats();
    } catch (e) {
      console.log(e);
    }
  }

  // =========================
  // EDIT PATIENT
  // =========================
  function startEditPatient() {
    if (!selectedPatient) return;
    setEditName(selectedPatient.name || "");
    setEditAge(selectedPatient.age?.toString() || "");
    setEditGender(selectedPatient.gender || "");
    setEditPhone(selectedPatient.phone || "");
    setEditComplaint(selectedPatient.complaint || "");
    setEditMsg("");
    setScreen("editPatient");
  }

  async function updatePatientDetails() {
    if (!selectedPatient?.id) return;
    if (!editName.trim()) {
      setEditMsg("⚠️ रोगी का नाम आवश्यक है।");
      return;
    }
    setEditingPatient(true);
    setEditMsg("⏳ विवरण अपडेट किया जा रहा है...");
    try {
      const updatedData = {
        name: editName.trim(),
        age: editAge ? Number(editAge) : null,
        gender: editGender || null,
        phone: editPhone.trim() || null,
        complaint: editComplaint.trim() || null
      };
      const { data, error } = await supabase.from("patients").update(updatedData).eq("id", selectedPatient.id).select().single();
      if (error) throw error;
      setSelectedPatient(data);
      setEditMsg("✅ विवरण सफलतापूर्वक अपडेट हो गया!");
      setTimeout(() => setScreen("profile"), 800);
    } catch (err) {
      setEditMsg("❌ Update Error: " + err.message);
    } finally {
      setEditingPatient(false);
    }
  }

  // =========================
  // FETCH PATIENTS
  // =========================
  async function fetchPatients() {
    try {
      setLoadingPatients(true);
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      alert("रोगी सूची लोड नहीं हुई: " + error.message);
    } finally {
      setLoadingPatients(false);
    }
  }

  function openPatientList(filter = "All") {
    setSearch("");
    setOpdFilter(filter);
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

  async function savePrescription() {
    if (!selectedPatient?.id) return;
    setSavingPrescription(true);
    setPrescriptionMsg("⏳ पर्चा सहेजा जा रहा है व स्टॉक अपडेट हो रहा है...");

    try {
      const nowIso = new Date().toISOString();
      const newRx = {
        patient_id: selectedPatient.id,
        medicines: medicines,
        diet_instructions: diet,
        lifestyle_advice: attendingDoctor,
        follow_up_days: followUpDays ? N
