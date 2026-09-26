// Rich code-native product illustrations tailored to exact item names & categories.
export default function ProductThumbnail({ product }) {
  const name = (product?.name || '').toLowerCase();
  const category = (product?.category || '').toLowerCase();
  let content;

  // 1. Earbuds / Headphones / Audio
  if (name.includes('bud') || name.includes('earphone') || name.includes('headphone') || name.includes('audio')) {
    content = (
      <>
        {/* Charging case & wireless earbuds */}
        <rect x="10" y="8" width="26" height="24" rx="8" fill="#334155" />
        <rect x="12" y="10" width="22" height="9" rx="4" fill="#64748b" opacity="0.6" />
        {/* Left Earbud */}
        <circle cx="17" cy="20" r="4.5" fill="#f8fafc" />
        <rect x="15.5" y="22" width="3" height="8" rx="1.5" fill="#f8fafc" />
        {/* Right Earbud */}
        <circle cx="29" cy="20" r="4.5" fill="#f8fafc" />
        <rect x="27.5" y="22" width="3" height="8" rx="1.5" fill="#f8fafc" />
        {/* Accent LED */}
        <circle cx="23" cy="28" r="1.5" fill="#38bdf8" />
      </>
    );
  }
  // 2. Hydraulic Jack / Mechanical Tool / Lift
  else if (name.includes('jack') || name.includes('hydraulic') || name.includes('lift')) {
    content = (
      <>
        {/* Base Plate */}
        <rect x="6" y="32" width="34" height="6" rx="2" fill="#b91c1c" />
        {/* Main Hydraulic Cylinder */}
        <rect x="16" y="14" width="14" height="19" rx="2" fill="#ef4444" />
        <rect x="19" y="8" width="8" height="8" rx="1" fill="#94a3b8" />
        {/* Piston Head */}
        <rect x="17" y="5" width="12" height="4" rx="1" fill="#475569" />
        {/* Handle socket & lever */}
        <path d="M30 26l9-10" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
        <circle cx="39" cy="16" r="2.5" fill="#1e293b" />
        <path d="M16 22h14" stroke="#7f1d1d" strokeWidth="1.5" />
      </>
    );
  }
  // 3. Ergonomic Office Chair
  else if (name.includes('chair')) {
    content = (
      <>
        <rect x="14" y="5" width="18" height="16" rx="4" fill="#3b82f6" />
        <path d="M12 21h22v5H12z" fill="#1d4ed8" />
        <path d="M17 26v6m12-6v6M10 14v10m26-10v10M23 32v6m-9 0 9-3 9 3" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    );
  }
  // 4. Standing Desk / Motorized Desk
  else if (name.includes('standing desk') || name.includes('desk')) {
    content = (
      <>
        {/* Desk Top */}
        <rect x="4" y="10" width="38" height="6" rx="2" fill="#92400e" />
        {/* Bevel */}
        <path d="M4 16h38v1H4z" fill="#78350f" />
        {/* Telescopic Legs */}
        <rect x="9" y="16" width="5" height="18" fill="#475569" />
        <rect x="32" y="16" width="5" height="18" fill="#475569" />
        {/* Feet */}
        <rect x="6" y="34" width="11" height="4" rx="1.5" fill="#334155" />
        <rect x="29" y="34" width="11" height="4" rx="1.5" fill="#334155" />
        {/* Digital Keypad */}
        <rect x="33" y="12" width="7" height="3" rx="0.8" fill="#38bdf8" />
      </>
    );
  }
  // 5. Table Frame
  else if (name.includes('table') || name.includes('frame')) {
    content = (
      <>
        <path d="M5 14l23-7 13 8-24 8z" fill="#cbd5e1" />
        <path d="M5 14l12 9 24-8v4l-24 8L5 18z" fill="#94a3b8" />
        <path d="M8 20v14m10-9v13m20-18v12M29 24v11" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  }
  // 6. Steel Rods / Rebars
  else if (name.includes('steel') || name.includes('rod') || name.includes('metal')) {
    content = (
      <>
        <path d="M12 6v32m7-34v34m7-32v32m7-33v33" stroke="#64748b" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M11 6v32m7-34v34m7-32v32m7-33v33" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      </>
    );
  }
  // 7. Cement Bag
  else if (name.includes('cement') || name.includes('mortar') || name.includes('concrete')) {
    content = (
      <>
        <path d="m10 9 21-3 4 7-1 21-23 4-3-7z" fill="#cbd5e1" />
        <path d="m10 9 20 4 5-1m-5 1v22" stroke="#94a3b8" fill="none" />
        <path d="m12 15 13 2v11l-13-2z" fill="#f1f5f9" />
        <path d="m14 20 8 1m-8 3 6 1" stroke="#64748b" strokeWidth="1.5" />
      </>
    );
  }
  // 8. Wood Plank / Timber
  else if (name.includes('plank') || name.includes('wood') || name.includes('timber')) {
    content = (
      <>
        <path d="m5 23 23-12 12 7-23 13z" fill="#d97706" />
        <path d="m5 23 12 8v6L5 29z" fill="#92400e" />
        <path d="m17 31 23-13v6L17 37z" fill="#b45309" />
        <path d="m12 22 18-8m-13 11 18-8m-17 12 17-9" stroke="#fde68a" strokeWidth="1.3" />
      </>
    );
  }
  // 9. Screws / Bolts / Hardware Fasteners
  else if (name.includes('screw') || name.includes('bolt') || name.includes('fastener')) {
    content = (
      <>
        <rect x="18" y="6" width="10" height="5" rx="1.5" fill="#64748b" />
        <path d="M20 11v22l3 4 3-4V11z" fill="#94a3b8" />
        <path d="M20 15h6m-6 4h6m-6 4h6m-6 4h6" stroke="#475569" strokeWidth="1.5" />
        <path d="M19 8h8" stroke="#f1f5f9" strokeWidth="1" />
      </>
    );
  }
  // 10. Shipping Box / Carton / Packaging
  else if (name.includes('box') || name.includes('carton') || name.includes('pack')) {
    content = (
      <>
        <path d="M7 14l16-7 16 7-16 7z" fill="#d97706" />
        <path d="M7 14l16 7v16L7 30z" fill="#b45309" />
        <path d="M23 21l16-7v16L23 37z" fill="#92400e" />
        <path d="M23 7l-7 10.5M23 7l7 10.5" stroke="#fde68a" strokeWidth="1.2" />
      </>
    );
  }
  // 11. Glass Top / Glass Sheet
  else if (name.includes('glass') || name.includes('mirror')) {
    content = (
      <>
        <rect x="6" y="8" width="34" height="26" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
        <path d="M12 30L30 12m-10 20L34 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </>
    );
  }
  // 12. Epoxy / Adhesive / Chemicals
  else if (name.includes('epoxy') || name.includes('adhesive') || name.includes('glue')) {
    content = (
      <>
        <rect x="14" y="12" width="18" height="24" rx="4" fill="#a855f7" />
        <rect x="19" y="6" width="8" height="7" rx="2" fill="#6b21a8" />
        <rect x="16" y="18" width="14" height="12" rx="2" fill="#f3e8ff" />
        <path d="M19 22h8m-8 4h5" stroke="#9333ea" strokeWidth="1.5" />
      </>
    );
  }
  // Category-based Smart Fallbacks
  else if (category.includes('furniture')) {
    content = (
      <>
        <rect x="14" y="5" width="18" height="16" rx="4" fill="#6366f1" />
        <path d="M12 21h22v5H12z" fill="#4338ca" />
        <path d="M17 26v6m12-6v6M10 14v10m26-10v10" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (category.includes('raw')) {
    content = (
      <>
        <path d="m5 23 23-12 12 7-23 13z" fill="#d97706" />
        <path d="m5 23 12 8v6L5 29z" fill="#92400e" />
        <path d="m17 31 23-13v6L17 37z" fill="#b45309" />
      </>
    );
  } else if (category.includes('pack')) {
    content = (
      <>
        <path d="M7 14l16-7 16 7-16 7z" fill="#f59e0b" />
        <path d="M7 14l16 7v16L7 30z" fill="#d97706" />
        <path d="M23 21l16-7v16L23 37z" fill="#b45309" />
      </>
    );
  } else {
    // Default Modern Box Package
    content = (
      <>
        <path d="M8 14l15-7 15 7-15 7z" fill="#3b82f6" />
        <path d="M8 14l15 7v15L8 29z" fill="#2563eb" />
        <path d="M23 21l15-7v15L23 36z" fill="#1d4ed8" />
        <path d="M23 7l-6 10.5M23 7l6 10.5" stroke="#93c5fd" strokeWidth="1" />
      </>
    );
  }

  return <svg className="catalog-illustration" viewBox="0 0 46 44" aria-hidden="true">{content}</svg>;
}
