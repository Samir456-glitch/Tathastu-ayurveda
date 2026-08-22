"use client";

import { useState, useEffect } from "react";
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
  const [opdFilter, setOpdFilter] = useState("All");

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
    samprapti: "", diagnosis: "", treatment_plan: "", clinical_notes: "",
  });
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");

  // Prescription States
  const [attendingDoctor, setAttendingDoctor] = useState(hospitalInfo.doctor_name);
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
    fetchStats();
  }, []);

  async function loadHospitalSettings() {
    try {
      const { data } = await supabase.from("hospital_settings").select("*").eq("id", 1).single();
      if (data) {
        setHospitalInfo(data);
        setAttendingDoctor(data.doctor_name || "Dr. Sumer Kumar Sharma");
      }
    } catch (e) {
      console.log(e);
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

      setStats({
        todayCount: todList.length,
        waitingCount: waiting,
        completedCount: completed,
        todayRevenue: todRev
      });
    } catch (e) {
      console.log(e);
    }
  }

  // =========================
  // SAVE PATIENT (Entry into OPD Queue)
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
      setMessage(`✅ रोगी टोकन दर्ज! (UHID: ${generatedId} | समय: ${regTime})`);
      setName(""); setAge(""); setGender(""); setPhone(""); setComplaint("");
      fetchStats();
    } catch (error) {
      setMessage("❌ Save Error: " + (error?.message || "Failed"));
    } finally {
      setSaving(false);
    }
  }

  // Update OPD Queue Status
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

      const { data, error } = await supabase
        .from("patients")
        .update(updatedData)
        .eq("id", selectedPatient.id)
        .select()
        .single();

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
  // PRESCRIPTION HELPERS (With Auto-Deduct Inventory)
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
        follow_up_days: followUpDays ? Number(followUpDays) : 7,
        investigations: investigations,
        created_at: nowIso
      };

      const { data, error } = await supabase.from("prescriptions").insert([newRx]).select().single();
      if (error) throw error;

      // Auto-deduct inventory if medicine matched
      for (const m of medicines) {
        if (m.name && m.name.trim()) {
          const { data: invMatches } = await supabase.from("inventory").select("*").ilike("medicine_name", `%${m.name.trim()}%`);
          if (invMatches && invMatches.length > 0) {
            const item = invMatches[0];
            const updatedStock = Math.max(0, (item.stock_quantity || 0) - 1);
            await supabase.from("inventory").update({ stock_quantity: updatedStock }).eq("id", item.id);
          }
        }
      }

      // Mark Patient OPD Status as Completed
      await updatePatientOpdStatus(selectedPatient.id, "Completed");

      setCurrentPrescription(data || newRx);
      setPrescriptionMsg("✅ पर्चा सहेजा गया व OPD परामर्श पूर्ण!");
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
  // FOLLOW-UP HELPERS & WHATSAPP
  // =========================
  async function fetchFollowUps() {
    if (!selectedPatient?.id) return;
    try {
      setFuPhone(selectedPatient.phone || "");
      setShowSendPrompt(false);
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

      const { data, error } = await supabase.from("follow_ups").insert([fuData]).select().single();
      if (error) throw error;

      setLastSavedFu(data || fuData);
      setFollowUpMsg("✅ Follow-up सफलतापूर्वक सहेजा गया!");
      setShowSendPrompt(true);
      fetchFollowUps();
    } catch (err) {
      setFollowUpMsg("❌ Error: " + err.message);
    } finally {
      setSavingFollowUp(false);
    }
  }

  function shareFollowUpWhatsApp(fuItem, targetPhone = null) {
    if (!selectedPatient) return;
    const fu = fuItem || lastSavedFu || {
      symptom_relief: fuSymptomRelief,
      treatment_modification: fuTreatmentMod,
      next_visit_days: fuNextVisit,
      created_at: new Date().toISOString()
    };

    let text = `🌿 *${hospitalInfo.hospital_name} - अनुवर्तन (Follow-up)*\n\n`;
    text += `*रोगी ID:* TAT-${selectedPatient.id}\n`;
    text += `*रोगी:* ${selectedPatient.name}\n`;
    text += `*विज़िट दिनांक:* ${formatDate(fu.created_at)}\n`;
    text += `*सुधार:* ${fu.symptom_relief || "प्रगति पर"}\n`;
    text += `*निर्देश:* ${fu.treatment_modification || "पूर्वतः जारी रखें"}\n\n`;
    text += `📅 *अगली विज़िट:* ${fu.next_visit_days || 7} दिन बाद।\n`;
    text += `*वैद्य:* ${fu.attending_doctor || attendingDoctor}`;

    const phoneToSend = targetPhone || fuPhone || selectedPatient.phone || "";
    const rawPhone = phoneToSend.replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      
    window.open(url, "_blank");
  }

  // =========================
  // BILLING MODULE
  // =========================
  async function fetchPatientBills() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase
        .from("billings")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBillsList(data || []);
      setScreen("billingScreen");
    } catch (err) {
      alert("बिल लोड नहीं हुआ: " + err.message);
    }
  }

  async function saveBillingReceipt() {
    if (!selectedPatient?.id) return;
    setSavingBill(true);
    setBillMsg("⏳ रसीद बन रही है...");

    try {
      const c = Number(consultFee) || 0;
      const m = Number(medFee) || 0;
      const p = Number(procedureFee) || 0;
      const d = Number(discountFee) || 0;
      const total = c + m + p - d;

      const billData = {
        patient_id: selectedPatient.id,
        consultation_fee: c,
        medicine_fee: m,
        procedure_fee: p,
        discount: d,
        total_amount: total,
        payment_mode: payMode,
        notes: billNotes,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from("billings").insert([billData]).select().single();
      if (error) throw error;

      setCurrentBill(data || billData);
      setBillMsg("✅ रसीद सफलतापूर्वक सहेजी गई!");
      fetchStats();
      setTimeout(() => setScreen("printBillPreview"), 600);
    } catch (err) {
      setBillMsg("❌ Error: " + err.message);
    } finally {
      setSavingBill(false);
    }
  }

  function shareBillWhatsApp() {
    if (!selectedPatient || !currentBill) return;
    let text = `🌿 *${hospitalInfo.hospital_name} - OPD रसीद (Invoice)*\n\n`;
    text += `*रसीद सं.:* RCP-${currentBill.id || "01"}\n`;
    text += `*रोगी:* ${selectedPatient.name} (TAT-${selectedPatient.id})\n`;
    text += `*दिनांक:* ${formatDate(currentBill.created_at)}\n\n`;
    text += `*विवरण:*\n`;
    text += `• परामर्श शुल्क: ₹${currentBill.consultation_fee}\n`;
    if (currentBill.medicine_fee > 0) text += `• औषधि शुल्क: ₹${currentBill.medicine_fee}\n`;
    if (currentBill.procedure_fee > 0) text += `• पंचकर्म/उपक्रम: ₹${currentBill.procedure_fee}\n`;
    if (currentBill.discount > 0) text += `• छूट: -₹${currentBill.discount}\n`;
    text += `-------------------------\n`;
    text += `*कुल भुगतान:* ₹${currentBill.total_amount} (${currentBill.payment_mode})\n\n`;
    text += `_स्वास्थ्य लाभ की शुभकामनाओं सहित!_`;

    const rawPhone = (selectedPatient.phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      
    window.open(url, "_blank");
  }

  // =========================
  // INVENTORY MODULE
  // =========================
  async function fetchInventory() {
    try {
      const { data, error } = await supabase.from("inventory").select("*").order("medicine_name", { ascending: true });
      if (error) throw error;
      setInventoryList(data || []);
      setScreen("inventoryScreen");
    } catch (err) {
      alert("स्टॉक सूची लोड नहीं हुई: " + err.message);
    }
  }

  async function addInventoryItem() {
    if (!invMedName.trim() || !invQty) {
      alert("कृपया दवा का नाम और मात्रा भरें");
      return;
    }
    setSavingInv(true);
    try {
      const item = {
        medicine_name: invMedName.trim(),
        category: invCategory,
        stock_quantity: Number(invQty),
        unit: invUnit,
        min_alert_limit: 10
      };
      const { error } = await supabase.from("inventory").insert([item]);
      if (error) throw error;
      setInvMedName("");
      setInvQty("");
      fetchInventory();
    } catch (err) {
      alert("दवा जोड़ने में त्रुटि: " + err.message);
    } finally {
      setSavingInv(false);
    }
  }

  // =========================
  // PATIENT DOCUMENTS MODULE
  // =========================
  async function fetchPatientDocuments() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase
        .from("patient_documents")
        .select("*")
        .eq("patient_id", selectedPatient.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatientDocs(data || []);
      setScreen("patientDocsScreen");
    } catch (err) {
      alert("रिपोर्ट लोड नहीं हुई: " + err.message);
    }
  }

  async function savePatientDocumentEntry() {
    if (!selectedPatient?.id || !newDocTitle.trim()) {
      alert("कृपया जाँच/रिपोर्ट का शीर्षक भरें");
      return;
    }
    setSavingDoc(true);
    try {
      const doc = {
        patient_id: selectedPatient.id,
        doc_title: newDocTitle.trim(),
        doc_type: newDocType,
        notes: newDocNotes.trim(),
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from("patient_documents").insert([doc]);
      if (error) throw error;
      setNewDocTitle("");
      setNewDocNotes("");
      fetchPatientDocuments();
    } catch (err) {
      alert("रिपोर्ट सहेजने में त्रुटि: " + err.message);
    } finally {
      setSavingDoc(false);
    }
  }

  // =========================
  // DIRECT PDF DOWNLOAD
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
        filename: `${selectedPatient?.name || "Patient"}_TAT-${selectedPatient?.id || "Doc"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
      alert("PDF डाउनलोड में समस्या आई।");
    } finally {
      setDownloadingPdf(false);
    }
  }

  function shareOnWhatsApp() {
    if (!selectedPatient || !currentPrescription) return;
    const regTime = formatTime(selectedPatient.created_at);
    const consultTime = formatTime(currentPrescription.created_at);

    let text = `🌿 *${hospitalInfo.hospital_name}*\n\n`;
    text += `*रोगी ID (UHID):* TAT-${selectedPatient.id}\n`;
    text += `*रोगी:* ${selectedPatient.name} (${selectedPatient.age || "—"}y / ${selectedPatient.gender || "—"})\n`;
    text += `*दिनांक:* ${formatDate(currentPrescription.created_at)}\n`;
    text += `*आगमन:* ${regTime} | *निकास:* ${consultTime}\n`;
    text += `*परामर्शक वैद्य:* ${currentPrescription.lifestyle_advice || attendingDoctor}\n\n`;
    text += `📋 *Rx (औषधि निर्देश):*\n`;
    currentPrescription.medicines?.forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}* [${m.category || "औषधि"}]\n   - मात्रा: ${m.dose || "—"} | काल: ${m.timing || "—"}\n   - अनुपान: ${m.anupana || "—"}\n`;
    });
    if (currentPrescription.investigations) {
      text += `\n🔬 *जाँच:* ${currentPrescription.investigations}\n`;
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

  // Filter with OPD Status
  const searchText = search.toLowerCase().trim();
  const filteredPatients = patients.filter((p) => {
    const pName = (p.name || "").toLowerCase();
    const pPhone = (p.phone || "").toString();
    const pId = (p.id || "").toString();
    const formattedId = `tat-${pId}`;
    const matchesSearch = pName.includes(searchText) || pPhone.includes(searchText) || pId.includes(searchText) || formattedId.includes(searchText);

    if (opdFilter === "Waiting") return matchesSearch && (p.opd_status || "Waiting") === "Waiting";
    if (opdFilter === "Completed") return matchesSearch && p.opd_status === "Completed";
    return matchesSearch;
  });

  // =========================
  // 1. HOME SCREEN
  // =========================
  if (screen === "home") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ color: "#2e7d32", margin: "0 0 4px 0" }}>🌿 Tathastu</h1>
            <h2 style={{ fontSize: "16px", color: "#333", margin: "0 0 2px 0" }}>{hospitalInfo.hospital_name}</h2>
            <h3 style={{ fontSize: "13px", color: "#666", marginTop: 0 }}>वैद्य डेस्क व लाइव OPD कतार</h3>
          </div>
          <button
            onClick={() => setScreen("settingsScreen")}
            style={{ padding: "8px 12px", background: "#fff", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
          >
            ⚙️ सेटिंग्स
          </button>
        </div>

        {/* Live OPD Queue Counters (BHAVYA Style) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px", maxWidth: "460px", margin: "14px 0" }}>
          <div
            onClick={() => openPatientList("All")}
            style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", padding: "8px 4px", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ fontSize: "11px", color: "#2e7d32", fontWeight: "bold" }}>कुल OPD</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1b5e20" }}>{stats.todayCount}</div>
          </div>
          <div
            onClick={() => openPatientList("Waiting")}
            style={{ background: "#fff8e1", border: "1.5px solid #ffe082", padding: "8px 4px", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ fontSize: "11px", color: "#f57f17", fontWeight: "bold" }}>⏳ प्रतीक्षारत</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#e65100" }}>{stats.waitingCount}</div>
          </div>
          <div
            onClick={() => openPatientList("Completed")}
            style={{ background: "#e0f2f1", border: "1px solid #80cbc4", padding: "8px 4px", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ fontSize: "11px", color: "#00695c", fontWeight: "bold" }}>✅ परामर्शित</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#004d40" }}>{stats.completedCount}</div>
          </div>
          <div style={{ background: "#f3e5f5", border: "1px solid #ce93d8", padding: "8px 4px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#6a1b9a", fontWeight: "bold" }}>शुल्क संग्रह</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#4a148c" }}>₹{stats.todayRevenue}</div>
          </div>
        </div>

        {/* Quick Search */}
        <div style={{ maxWidth: "460px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="🔍 रोगी ID (उदा. TAT-1), नाम या मोबाइल खोजें..."
            onFocus={() => openPatientList("All")}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #2e7d32", boxSizing: "border-box", background: "#fff", fontSize: "14px" }}
          />
        </div>

        {/* Navigation Grid */}
        <div style={{ display: "grid", gap: "10px", maxWidth: "460px" }}>
          <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500", textAlign: "left" }} onClick={() => setScreen("newPatient")}>
            ➕ <strong>नया टोकन / रोगी पंजीकरण</strong> (OPD Entry)
          </button>
          <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ffb74d", background: "#fff8e1", fontWeight: "500", textAlign: "left" }} onClick={() => openPatientList("Waiting")}>
            ⏳ <strong>लाइव OPD कतार (Waiting Room - {stats.waitingCount})</strong>
          </button>
          <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500", textAlign: "left" }} onClick={() => openPatientList("All")}>
            👤 <strong>समस्त पंजीकृत रोगी सूची</strong> (UHID Directory)
          </button>
          <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #81c784", background: "#f1f8e9", fontWeight: "500", textAlign: "left" }} onClick={fetchInventory}>
            📦 <strong>औषधि भंडार व स्टॉक (Pharmacy Inventory)</strong>
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // 2. HOSPITAL SETTINGS SCREEN
  // =========================
  if (screen === "settingsScreen") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>
        <h2>⚙️ हॉस्पिटल व लेटरहेड सेटिंग्स</h2>
        <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "500px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>हॉस्पिटल / क्लिनिक नाम:</label>
            <input value={hospitalInfo.hospital_name} onChange={(e) => setHospitalInfo({ ...hospitalInfo, hospital_name: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>टैगलाइन / उप-शीर्षक:</label>
            <input value={hospitalInfo.tagline} onChange={(e) => setHospitalInfo({ ...hospitalInfo, tagline: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>क्लिनिक पता (Address):</label>
            <input value={hospitalInfo.address} onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>हेल्पलाइन / फोन नंबर:</label>
            <input value={hospitalInfo.contact_phone} onChange={(e) => setHospitalInfo({ ...hospitalInfo, contact_phone: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>मुख्य चिकित्सक नाम:</label>
            <input value={hospitalInfo.doctor_name} onChange={(e) => setHospitalInfo({ ...hospitalInfo, doctor_name: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>योग्यता (Qualifications):</label>
            <input value={hospitalInfo.doctor_qualification} onChange={(e) => setHospitalInfo({ ...hospitalInfo, doctor_qualification: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>काउंसिल रजिस्ट्रेशन सं. (Reg. No):</label>
            <input value={hospitalInfo.reg_number} onChange={(e) => setHospitalInfo({ ...hospitalInfo, reg_number: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <button onClick={saveHospitalSettings} disabled={savingSettings} style={{ width: "100%", padding: "12px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            {savingSettings ? "⏳ सहेजा जा रहा है..." : "💾 सेटिंग्स सहेजें"}
          </button>
          {settingsMsg && <div style={{ marginTop: "10px", fontWeight: "bold" }}>{settingsMsg}</div>}
        </div>
      </main>
    );
  }

  // =========================
  // 3. NEW PATIENT SCREEN
  // =========================
  if (screen === "newPatient") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => { setMessage(""); setScreen("home"); }}>
          ← वापस
        </button>
        <h2>👤 नया टोकन व पंजीकरण</h2>
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
            {saving ? "⏳ सहेजा जा रहा है..." : "💾 टोकन जारी करें (कतार में जोड़ें)"}
          </button>
          {message && <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", fontWeight: "bold", border: "1px solid #ddd" }}>{message}</div>}
        </div>
      </main>
    );
  }

  // =========================
  // 4. EDIT PATIENT SCREEN
  // =========================
  if (screen === "editPatient" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← वापस प्रोफाइल
        </button>
        <h2>✏️ रोगी विवरण सुधारें (TAT-{selectedPatient.id})</h2>
        <div style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>रोगी का नाम:</label>
            <input style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>आयु:</label>
            <input style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} type="number" min="0" value={editAge} onChange={(e) => setEditAge(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>लिंग:</label>
            <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} value={editGender} onChange={(e) => setEditGender(e.target.value)}>
              <option value="">लिंग चुनें</option>
              <option value="Male">पुरुष</option>
              <option value="Female">महिला</option>
              <option value="Other">अन्य</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>मोबाइल नंबर:</label>
            <input style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>मुख्य शिकायत:</label>
            <textarea style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} rows="4" value={editComplaint} onChange={(e) => setEditComplaint(e.target.value)} />
          </div>
          <button style={{ padding: "12px", fontWeight: "bold", cursor: "pointer", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px" }} onClick={updatePatientDetails} disabled={editingPatient}>
            {editingPatient ? "⏳ अपडेट हो रहा है..." : "💾 अपडेट करें"}
          </button>
          {editMsg && <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", fontWeight: "bold", border: "1px solid #ddd" }}>{editMsg}</div>}
        </div>
      </main>
    );
  }

  // =========================
  // 5. PATIENT LIST & QUEUE SCREEN (BHAVYA OPD Queue)
  // =========================
  if (screen === "patients") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0 }}>📋 OPD कतार व रोगी सूची</h2>
          <span style={{ fontSize: "13px", fontWeight: "bold", color: "#2e7d32" }}>फ़िल्टर: {opdFilter}</span>
        </div>

        {/* Tab Filters */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px", maxWidth: "500px" }}>
          <button
            onClick={() => setOpdFilter("All")}
            style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc", background: opdFilter === "All" ? "#2e7d32" : "#fff", color: opdFilter === "All" ? "#fff" : "#333", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
          >
            सभी (All)
          </button>
          <button
            onClick={() => setOpdFilter("Waiting")}
            style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ffe082", background: opdFilter === "Waiting" ? "#f57f17" : "#fff8e1", color: opdFilter === "Waiting" ? "#fff" : "#e65100", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
          >
            ⏳ प्रतीक्षारत (Waiting)
          </button>
          <button
            onClick={() => setOpdFilter("Completed")}
            style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #80cbc4", background: opdFilter === "Completed" ? "#00695c" : "#e0f2f1", color: opdFilter === "Completed" ? "#fff" : "#004d40", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
          >
            ✅ परामर्शित (Done)
          </button>
        </div>

        <input
          type="text"
          placeholder="🔎 रोगी ID (उदा. TAT-1), नाम या मोबाइल से खोजें..."
          value={search}
          autoFocus
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "500px", padding: "12px", marginBottom: "16px", boxSizing: "border-box", borderRadius: "8px", border: "2px solid #2e7d32", fontSize: "14px" }}
        />

        {loadingPatients ? (
          <p>⏳ लोड हो रहा है...</p>
        ) : filteredPatients.length === 0 ? (
          <p>कोई रोगी नहीं मिला।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "500px" }}>
            {filteredPatients.map((p) => {
              const isWaiting = (p.opd_status || "Waiting") === "Waiting";
              return (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setScreen("profile"); }}
                  style={{ padding: "14px", background: "#fff", border: isWaiting ? "1.5px solid #ffe082" : "1px solid #ddd", borderRadius: "10px", cursor: "pointer", position: "relative" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px", color: "#222" }}>👤 {p.name}</div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ background: isWaiting ? "#fff8e1" : "#e8f5e9", color: isWaiting ? "#e65100" : "#2e7d32", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                        {isWaiting ? "⏳ Waiting" : "✅ Done"}
                      </span>
                      <span style={{ background: "#2e7d32", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                        TAT-{p.id}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                    🕒 टोकन समय: {formatDate(p.created_at)} ({formatTime(p.created_at)})
                  </div>
                  <div style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>आयु: {p.age || "—"} | {p.gender || "—"} | 📱 {p.phone || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#333", marginTop: "4px" }}>🩺 {p.complaint || "कोई शिकायत नहीं"}</div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 6. PATIENT PROFILE SCREEN
  // =========================
  if (screen === "profile" && selectedPatient) {
    const p = selectedPatient;
    const isWaiting = (p.opd_status || "Waiting") === "Waiting";

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("patients")}>
          ← रोगी सूची / कतार
        </button>
        <h2>👤 रोगी प्रोफाइल व क्लिनिकल फाइल</h2>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "18px", maxWidth: "480px", border: "1px solid #ddd" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <span style={{ background: "#2e7d32", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold" }}>
              UHID: TAT-{p.id}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isWaiting ? "#fff8e1" : "#e8f5e9", padding: "8px 10px", borderRadius: "6px", margin: "10px 0", fontSize: "13px" }}>
            <span><strong>स्थिति:</strong> {isWaiting ? "⏳ प्रतीक्षारत (In Queue)" : "✅ परामर्श पूर्ण"}</span>
            <button
              onClick={() => updatePatientOpdStatus(p.id, isWaiting ? "Completed" : "Waiting")}
              style={{ padding: "4px 8px", background: "#fff", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
            >
              {isWaiting ? "Mark as Done" : "Mark as Waiting"}
            </button>
          </div>

          <p style={{ margin: "6px 0" }}><strong>आयु:</strong> {p.age || "—"} | <strong>लिंग:</strong> {p.gender || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>मोबाइल:</strong> {p.phone || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>मुख्य शिकायत:</strong><br />{p.complaint || "—"}</p>

          <button
            onClick={startEditPatient}
            style={{ width: "100%", padding: "8px", margin: "8px 0 14px 0", cursor: "pointer", background: "#fff", border: "1px solid #1976d2", color: "#1976d2", borderRadius: "6px", fontWeight: "bold", fontSize: "13px" }}
          >
            ✏️ रोगी विवरण सुधारें (Edit Profile)
          </button>

          <hr style={{ margin: "12px 0" }} />

          <button
            onClick={() => { setAssessmentMessage(""); setScreen("assessment"); }}
            style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", textAlign: "left" }}
          >
            📋 <strong>Clinical Assessment</strong> (चिकित्सकीय परीक्षण)
          </button>

          <button
            onClick={() => { setPrescriptionMsg(""); setScreen("prescription"); }}
            style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#e8f5e9", border: "1px solid #81c784", borderRadius: "6px", textAlign: "left" }}
          >
            💊 <strong>नया Prescription</strong> (पर्चा बनाएँ)
          </button>

          <button
            onClick={fetchPatientDocuments}
            style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#e1f5fe", border: "1px solid #81d4fa", borderRadius: "6px", textAlign: "left" }}
          >
            📑 <strong>जाँच व रिपोर्ट फाइलें (Lab / USG / ECG)</strong>
          </button>

          <button
            onClick={fetchFollowUps}
            style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: "6px", textAlign: "left" }}
          >
            🔄 <strong>अनुवर्तन (Follow-up Tracker)</strong>
          </button>

          <button
            onClick={fetchPatientBills}
            style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#e0f2f1", border: "1px solid #80cbc4", borderRadius: "6px", textAlign: "left" }}
          >
            💳 <strong>OPD बिलिंग व रसीद (Billing & Receipts)</strong>
          </button>

          <button
            onClick={() => setScreen("panchakarmaPlaceholder")}
            style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: "6px", textAlign: "left" }}
          >
            🧘 <strong>पंचकर्म व उपक्रम (Panchakarma Protocol)</strong>
          </button>

          <button
            onClick={fetchPatientPrescriptions}
            style={{ width: "100%", padding: "12px", cursor: "pointer", fontWeight: "bold", background: "#fff", border: "1px solid #90caf9", borderRadius: "6px", textAlign: "left" }}
          >
            📜 <strong>सहेजे गए पर्चे देखें / Print करें</strong>
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // 7. PATIENT DOCUMENTS MODULE
  // =========================
  if (screen === "patientDocsScreen" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← वापस प्रोफाइल
        </button>
        <h2>📑 जाँच व रिपोर्ट फाइलें - {selectedPatient.name} (TAT-{selectedPatient.id})</h2>

        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "500px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#0277bd" }}>➕ नई जाँच / रिपोर्ट विवरण जोड़ें</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            <input
              placeholder="जाँच का नाम (उदा. USG Abdomen, CBC, 12-Lead ECG)"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="Lab Report (रक्त/मूत्र जाँच)">Lab Report (रक्त/मूत्र जाँच)</option>
              <option value="USG / Sonography">USG / Sonography</option>
              <option value="X-Ray (रेडियोलॉजी)">X-Ray (रेडियोलॉजी)</option>
              <option value="ECG Tracing">ECG Tracing</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="अन्य दस्तावेज">अन्य दस्तावेज</option>
            </select>
            <textarea
              placeholder="निष्कर्ष / मुख्य टिप्पणियाँ (Findings / Impression)..."
              rows="3"
              value={newDocNotes}
              onChange={(e) => setNewDocNotes(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <button
              onClick={savePatientDocumentEntry}
              disabled={savingDoc}
              style={{ padding: "12px", background: "#0277bd", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
            >
              {savingDoc ? "⏳ सहेजा जा रहा है..." : "💾 रिपोर्ट रिकॉर्ड जोड़ें"}
            </button>
          </div>
        </div>

        {/* Existing Docs */}
        <h3 style={{ color: "#333" }}>📋 संलग्न रिपोर्टें ({patientDocs.length})</h3>
        {patientDocs.length === 0 ? (
          <p>कोई पूर्व रिपोर्ट दर्ज नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "500px" }}>
            {patientDocs.map((doc, idx) => (
              <div key={doc.id || idx} style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #b3e5fc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "15px", color: "#01579b" }}>{doc.doc_title}</strong>
                  <span style={{ fontSize: "11px", background: "#e1f5fe", color: "#0277bd", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                    {doc.doc_type}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>दिनांक: {formatDate(doc.created_at)}</div>
                {doc.notes && <div style={{ fontSize: "13px", color: "#333", marginTop: "6px", background: "#fafafa", padding: "6px", borderRadius: "4px" }}>{doc.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 8. CLINICAL ASSESSMENT SCREEN
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
  // 9. PRESCRIPTION CREATE SCREEN
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
            🕒 टोकन समय: {formatDate(selectedPatient.created_at)} at {formatTime(selectedPatient.created_at)}
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

          {/* Categorized Tabs */}
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
            {savingPrescription ? "⏳ सहेजा जा रहा है..." : "💾 प्रिस्क्रिप्शन सहेजें व स्टॉक अपडेट करें"}
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
  // 10. FOLLOW-UP TRACKER SCREEN
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
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>📱 रोगी का मोबाइल नंबर:</label>
            <input
              type="tel"
              value={fuPhone}
              placeholder="10 अंकों का मोबाइल नंबर..."
              onChange={(e) => setFuPhone(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

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
            style={{ width: "100%", padding: "12px", background: "#f57c00", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
          >
            {savingFollowUp ? "⏳ सहेजा जा रहा है..." : "💾 Follow-up सहेजें"}
          </button>

          {showSendPrompt && (
            <div style={{ marginTop: "14px", padding: "12px", background: "#e8f5e9", border: "1.5px solid #81c784", borderRadius: "8px" }}>
              <div style={{ fontWeight: "bold", color: "#2e7d32", marginBottom: "8px", fontSize: "14px" }}>
                💬 क्या आप रोगी को WhatsApp पर Follow-up संदेश भेजना चाहते हैं?
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => shareFollowUpWhatsApp(null, fuPhone)}
                  style={{ flex: 1, padding: "10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  📲 हाँ, WhatsApp भेजें
                </button>
                <button
                  onClick={() => setShowSendPrompt(false)}
                  style={{ flex: 1, padding: "10px", background: "#757575", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  ❌ नहीं, अभी न भेजें
                </button>
              </div>
            </div>
          )}

          {followUpMsg && <div style={{ marginTop: "10px", fontWeight: "bold", color: "#2e7d32" }}>{followUpMsg}</div>}
        </div>

        {/* Previous Follow-up Timeline */}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed #eee" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>अगली विज़िट: {fu.next_visit_days} दिन बाद</span>
                  <button
                    onClick={() => shareFollowUpWhatsApp(fu, fuPhone)}
                    style={{ padding: "5px 10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    💬 WhatsApp भेजें
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 11. BILLING & RECEIPTS SCREEN
  // =========================
  if (screen === "billingScreen" && selectedPatient) {
    const c = Number(consultFee) || 0;
    const m = Number(medFee) || 0;
    const p = Number(procedureFee) || 0;
    const d = Number(discountFee) || 0;
    const total = c + m + p - d;

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>
        <h2>💳 OPD बिलिंग व रसीद - {selectedPatient.name} (TAT-{selectedPatient.id})</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "500px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#00796b" }}>➕ नया बिल / रसीद तैयार करें</h3>
          
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>परामर्श शुल्क (Consultation Fee ₹):</label>
            <input type="number" value={consultFee} onChange={(e) => setConsultFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>औषधि शुल्क (Medicine Charges ₹):</label>
            <input type="number" value={medFee} onChange={(e) => setMedFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>पंचकर्म / प्रक्रिया शुल्क (Procedure Fee ₹):</label>
            <input type="number" value={procedureFee} onChange={(e) => setProcedureFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>छूट / रियायत (Discount ₹):</label>
            <input type="number" value={discountFee} onChange={(e) => setDiscountFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>भुगतान माध्यम (Payment Mode):</label>
            <select value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="Cash (नकद)">Cash (नकद)</option>
              <option value="UPI / QR Code">UPI / QR Code</option>
              <option value="Card (कार्ड)">Card (कार्ड)</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>

          <div style={{ background: "#e0f2f1", padding: "12px", borderRadius: "6px", margin: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "16px", color: "#004d40" }}>कुल देय राशि:</strong>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#00796b" }}>₹{total}</span>
          </div>

          <button onClick={saveBillingReceipt} disabled={savingBill} style={{ width: "100%", padding: "12px", background: "#00796b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}>
            {savingBill ? "⏳ रसीद बन रही है..." : "💾 रसीद सहेजें व Print करें"}
          </button>
          {billMsg && <div style={{ marginTop: "10px", fontWeight: "bold" }}>{billMsg}</div>}
        </div>

        {/* Previous Invoices */}
        <h3 style={{ color: "#333" }}>📜 पूर्व रसीदें ({billsList.length})</h3>
        {billsList.length === 0 ? (
          <p>कोई बिलिंग रिकॉर्ड मौजूद नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "500px" }}>
            {billsList.map((b, idx) => (
              <div key={b.id || idx} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span>रसीद #{b.id}</span>
                  <span style={{ color: "#00796b" }}>₹{b.total_amount} ({b.payment_mode})</span>
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>दिनांक: {formatDate(b.created_at)} at {formatTime(b.created_at)}</div>
                <button
                  onClick={() => { setCurrentBill(b); setScreen("printBillPreview"); }}
                  style={{ marginTop: "8px", padding: "6px 12px", background: "#00796b", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                >
                  👁️ रसीद देखें / Print
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 12. PRINT BILL PREVIEW SCREEN
  // =========================
  if (screen === "printBillPreview" && selectedPatient && currentBill) {
    const b = currentBill;
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
            ← वापस प्रोफाइल
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={shareBillWhatsApp} style={{ padding: "8px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              💬 WhatsApp
            </button>
            <button onClick={downloadPdfDirect} style={{ padding: "8px 14px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              📥 PDF डाउनलोड
            </button>
          </div>
        </div>

        <div id="printableArea" style={{ border: "2px solid #00796b", padding: "20px", borderRadius: "10px", background: "#fff" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #00796b", paddingBottom: "10px", marginBottom: "14px" }}>
            <h2 style={{ margin: "0", color: "#00796b", fontSize: "20px" }}>🌿 {hospitalInfo.hospital_name}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{hospitalInfo.address} | 📱 {hospitalInfo.contact_phone}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#333", fontWeight: "bold" }}>OPD परामर्श एवं चिकित्सा रसीद (Official Receipt)</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "14px", background: "#e0f2f1", padding: "8px", borderRadius: "6px" }}>
            <div>
              <strong>रोगी:</strong> {selectedPatient.name}<br />
              <strong>UHID:</strong> TAT-{selectedPatient.id}
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>रसीद सं.:</strong> RCP-{b.id || "01"}<br />
              <strong>दिनांक:</strong> {formatDate(b.created_at)} ({formatTime(b.created_at)})
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "14px" }}>
            <thead>
              <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>मद (Particulars)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", width: "100px" }}>राशि (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>परामर्श शुल्क (Consultation)</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{b.consultation_fee}</td>
              </tr>
              {b.medicine_fee > 0 && (
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>औषधि शुल्क (Medicines)</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{b.medicine_fee}</td>
                </tr>
              )}
              {b.procedure_fee > 0 && (
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>पंचकर्म / उपक्रम (Procedure)</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{b.procedure_fee}</td>
                </tr>
              )}
              {b.discount > 0 && (
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd", color: "green" }}>छूट (Discount)</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", color: "green" }}>-₹{b.discount}</td>
                </tr>
              )}
              <tr style={{ background: "#e0f2f1", fontWeight: "bold" }}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>कुल प्राप्त राशि (Total Paid)</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", color: "#004d40", fontSize: "15px" }}>₹{b.total_amount}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: "12px", color: "#555", marginBottom: "16px" }}>
            <strong>भुगतान विधि:</strong> {b.payment_mode}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", fontSize: "12px" }}>
            <div>_शीघ्र स्वास्थ्य लाभ की कामना सहित!_</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px dashed #333", width: "120px", paddingTop: "4px", fontWeight: "bold" }}>अधिकृत हस्ताक्षर</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // 13. PANCHAKARMA PLACEHOLDER SCREEN
  // =========================
  if (screen === "panchakarmaPlaceholder" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>
        <h2>🧘 पंचकर्म व उपक्रम प्रबंधन</h2>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #ce93d8", maxWidth: "500px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#6a1b9a" }}>👤 {selectedPatient.name} (TAT-{selectedPatient.id})</h3>
          <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>
            यह पंचकर्म मॉड्यूल का मुख्य स्ट्रक्चर है। यहाँ आगे चलकर <strong>स्नेहन, स्वेदन, वमन, विरेचन, बस्ति, नस्य, जानुबस्ति, कटीबस्ति और शिरोधारा</strong> के सिटिंग शेड्यूल, तेल/काढ़ा चयन और डेट-वाइज सेशन ट्रैकिंग जोड़ी जाएगी।
          </p>
          <div style={{ background: "#f3e5f5", padding: "12px", borderRadius: "6px", fontWeight: "bold", color: "#6a1b9a", fontSize: "13px" }}>
            ✨ यह सेक्शन आपके आगामी थेरेपी प्रोटोकॉल और शेड्यूलिंग के लिए आरक्षित है।
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // 14. PHARMACY INVENTORY SCREEN
  // =========================
  if (screen === "inventoryScreen") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>
        <h2>📦 औषधि भंडार व स्टॉक (Pharmacy Inventory)</h2>

        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "550px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>➕ नया स्टॉक दर्ज करें</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            <input
              placeholder="औषधि का नाम (उदा. Chandraprabha Vati)"
              value={invMedName}
              onChange={(e) => setInvMedName(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <select value={invCategory} onChange={(e) => setInvCategory(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                <option value="वटी / गुटिका">वटी / गुटिका</option>
                <option value="आसव / अरिष्ट">आसव / अरिष्ट</option>
                <option value="चूर्ण">चूर्ण</option>
                <option value="गुग्गुलु / रस">गुग्गुलु / रस</option>
                <option value="क्वाथ / तैल / अन्य">क्वाथ / तैल / अन्य</option>
              </select>
              <input
                type="number"
                placeholder="मात्रा (Quantity)"
                value={invQty}
                onChange={(e) => setInvQty(e.target.value)}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
            </div>
            <button onClick={addInventoryItem} disabled={savingInv} style={{ padding: "12px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
              {savingInv ? "⏳ सहेजा जा रहा है..." : "➕ स्टॉक में जोड़ें"}
            </button>
          </div>
        </div>

        {/* Stock List */}
        <h3 style={{ color: "#333" }}>📋 वर्तमान स्टॉक सूची ({inventoryList.length})</h3>
        {inventoryList.length === 0 ? (
          <p>स्टॉक में कोई दवा दर्ज नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "8px", maxWidth: "550px" }}>
            {inventoryList.map((item, idx) => (
              <div key={item.id || idx} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "15px" }}>{item.medicine_name}</strong>
                  <div style={{ fontSize: "12px", color: "#666" }}>वर्ग: {item.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: item.stock_quantity <= 10 ? "red" : "#2e7d32" }}>
                    {item.stock_quantity}
                  </span>
                  <div style={{ fontSize: "11px", color: item.stock_quantity <= 10 ? "red" : "#666" }}>
                    {item.stock_quantity <= 10 ? "⚠️ Low Stock" : "उपलब्ध"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // 15. SAVED PRESCRIPTION LIST SCREEN
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
  // 16. PRINT / PDF PREVIEW SCREEN (Updated Dynamic Letterhead)
  // =========================
  if (screen === "printPreview" && selectedPatient && currentPrescription) {
    const rx = currentPrescription;
    const entryTimeStr = formatTime(selectedPatient.created_at);
    const exitTimeStr = formatTime(rx.created_at);
    const consultDateStr = formatDate(rx.created_at);

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif", maxWidth: "720px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", marginBottom: "16px" }}>
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
            ← वापस प्रोफाइल
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

        {/* Dynamic Letterhead */}
        <div id="printableArea" style={{ border: "2px solid #2e7d32", padding: "20px", borderRadius: "10px", background: "#fff" }}>
          
          <div style={{ textAlign: "center", borderBottom: "2px solid #2e7d32", paddingBottom: "10px", marginBottom: "14px" }}>
            <h1 style={{ margin: "0", color: "#2e7d32", fontSize: "22px" }}>🌿 {hospitalInfo.hospital_name}</h1>
            <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#333", fontWeight: "bold" }}>{hospitalInfo.tagline}</p>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{hospitalInfo.address} | 📱 {hospitalInfo.contact_phone}</p>
            <div style={{ fontSize: "11px", color: "#2e7d32", fontWeight: "bold", marginTop: "2px" }}>
              {hospitalInfo.doctor_name} ({hospitalInfo.doctor_qualification}) | {hospitalInfo.reg_number}
            </div>
          </div>

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
              <div style={{ color: "#444" }}><strong>आगमन:</strong> {entryTimeStr}</div>
              <div style={{ color: "#2e7d32", fontWeight: "bold" }}><strong>निकास:</strong> {exitTimeStr}</div>
            </div>
          </div>

          <h3 style={{ color: "#2e7d32", borderBottom: "1px solid #2e7d32", paddingBottom: "4px", margin: "10px 0 8px 0", fontSize: "15px" }}>Rx (औषधि निर्देश)</h3>
          
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

          {rx.investigations && (
            <div style={{ marginTop: "10px", marginBottom: "12px" }}>
              <strong style={{ color: "#0277bd", fontSize: "13px" }}>🔬 आवश्यक जाँच (Investigations):</strong>
              <div style={{ background: "#e1f5fe", padding: "6px 10px", borderRadius: "4px", border: "1px solid #b3e5fc", margin: "4px 0", fontSize: "12px", color: "#01579b" }}>
                {rx.investigations}
              </div>
            </div>
          )}

          {rx.diet_instructions && (
            <div style={{ marginTop: "10px", marginBottom: "14px" }}>
              <strong style={{ color: "#2e7d32", fontSize: "13px" }}>🥗 पथ्यापथ्य निर्देश:</strong>
              <div style={{ background: "#fafafa", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e0e0e0", margin: "4px 0", fontSize: "12px", color: "#333" }}>
                {rx.diet_instructions}
              </div>
            </div>
          )}

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
