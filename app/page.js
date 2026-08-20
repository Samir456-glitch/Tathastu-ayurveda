export default function Home() {
  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🌿 Tathastu</h1>
      <h2>आयुर्वेद चिकित्सा सहायक</h2>

      <hr />

      <h3>वैद्य डेस्क</h3>

      <div style={{ display: "grid", gap: "12px", maxWidth: "400px" }}>
        <button>➕ नया रोगी</button>
        <button>👤 रोगी सूची</button>
        <button>📋 चिकित्सकीय परीक्षण</button>
        <button>💊 चिकित्सा / Prescription</button>
        <button>🔄 अनुवर्तन (Follow-up)</button>
        <button>🚨 आपातकाल / Referral</button>
      </div>
    </main>
  );
}
