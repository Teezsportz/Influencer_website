import type { Client, Comment, Post } from "../types";

const today = new Date();

function isoDate(offsetDays: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isoNow(minutesAgo = 0): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

// Fixed date within the current calendar year, for historical months of the
// content calendar (Jan through last month) — unlike isoDate(), this doesn't
// move around relative to "now".
function monthDate(month: number, day: number): string {
  const year = today.getFullYear();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Self-contained, brand-styled creative illustrations — no external hosting,
// so they can never go missing. Every card carries a faint honeycomb texture
// in the digitX accent color as a subtle "made on DigitX" watermark, tinted
// per-brand, with a big expressive emoji standing in for the caricature art.
// Swap for a real upload any time via the editor's "Creative" field.
const HONEYCOMB_ACCENT = "#FFA10A"; // Xanthous — digitX secondary brand color

function hexPattern(id: string, color: string): string {
  const r = 16;
  const hx = Math.round(r * Math.sqrt(3) * 100) / 200; // half-width
  const w = hx * 2;
  const h = r * 3;
  const hex = (cx: number, cy: number) =>
    `M${cx},${cy - r} L${cx - hx},${cy - r / 2} L${cx - hx},${cy + r / 2} L${cx},${cy + r} L${cx + hx},${cy + r / 2} L${cx + hx},${cy - r / 2} Z`;
  return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">
    <path d="${hex(hx, r)}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.16" />
    <path d="${hex(0, r * 2.5)}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.16" />
    <path d="${hex(w, r * 2.5)}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.16" />
  </pattern>`;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function creative(bg: string, fg: string, emoji: string, label: string): string {
  const patternId = `hex-${bg.replace("#", "")}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
    <defs>${hexPattern(patternId, HONEYCOMB_ACCENT)}</defs>
    <rect width='600' height='600' fill='${bg}'/>
    <rect width='600' height='600' fill='url(#${patternId})'/>
    <circle cx='300' cy='250' r='132' fill='#ffffff' fill-opacity='0.55'/>
    <text x='300' y='300' font-size='140' text-anchor='middle'>${escapeXml(emoji)}</text>
    <text x='300' y='524' font-family='Inter, sans-serif' font-size='32' font-weight='700'
      fill='${fg}' text-anchor='middle'>${escapeXml(label)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CARICATURES = {
  p1: creative("#DBEAFE", "#0F4C81", "🏡", "Home Loan Rates"),
  p2: creative("#BFDBFE", "#0F4C81", "🐷", "Saving Tips"),
  p3: creative("#93C5FD", "#0F4C81", "🙌", "Customer Story"),
  p4: creative("#FBCFE8", "#831843", "🧴", "Glow Serum"),
  p5: creative("#F9A8D4", "#831843", "🌙", "5-Step Routine"),
  p6: creative("#FECACA", "#7F1D1D", "🚿", "New Water Heater"),
  p7: creative("#FCA5A5", "#7F1D1D", "💡", "Energy-Saving Tips"),
  p8: creative("#FDE68A", "#7C2D12", "🍝", "Sunday Jollof Swap"),
  p9: creative("#FCD34D", "#78350F", "🏭", "Behind the Pack"),
  p10: creative("#FBBF24", "#78350F", "🍲", "Pot Finisher"),

  // Firstbank — Jan through Aug
  p11: creative("#DBEAFE", "#0F4C81", "🎯", "New Year Goals"),
  p12: creative("#BFDBFE", "#0F4C81", "💌", "Love & Money"),
  p13: creative("#93C5FD", "#0F4C81", "👑", "Women Who Save"),
  p14: creative("#DBEAFE", "#0F4C81", "✈️", "Easter Getaway Loan"),
  p15: creative("#BFDBFE", "#0F4C81", "💼", "Salary Account Perks"),
  p16: creative("#93C5FD", "#0F4C81", "📊", "Mid-Year Checkup"),
  p17: creative("#DBEAFE", "#0F4C81", "🌱", "Grow Your Naira"),
  p18: creative("#BFDBFE", "#0F4C81", "🎒", "School Fees Support"),

  // Kivo — Jan through Aug
  p19: creative("#FBCFE8", "#831843", "✨", "New Year Skin Reset"),
  p20: creative("#F9A8D4", "#831843", "💋", "Glow For Your Date"),
  p21: creative("#FBCFE8", "#831843", "🌸", "Self-Care Month"),
  p22: creative("#F9A8D4", "#831843", "🐣", "Easter Skin Refresh"),
  p23: creative("#FBCFE8", "#831843", "🌧️", "Rainy Season Prep"),
  p24: creative("#F9A8D4", "#831843", "🪞", "Mid-Year Glow Check"),
  p25: creative("#FBCFE8", "#831843", "☀️", "Sun Protection"),
  p26: creative("#F9A8D4", "#831843", "🎒", "Prep for Resumption"),

  // Ariston — Jan through Aug
  p27: creative("#FECACA", "#7F1D1D", "🏠", "New Year Upgrade"),
  p28: creative("#FCA5A5", "#7F1D1D", "🛁", "Warm Baths For Two"),
  p29: creative("#FECACA", "#7F1D1D", "🏡", "Comfort For Every Home"),
  p30: creative("#FCA5A5", "#7F1D1D", "🧳", "Travel Safe This Easter"),
  p31: creative("#FECACA", "#7F1D1D", "🔧", "Mid-Year Maintenance"),
  p32: creative("#FCA5A5", "#7F1D1D", "⛈️", "Power Surge Safety"),
  p33: creative("#FECACA", "#7F1D1D", "☔", "Beat the Rainy Chill"),
  p34: creative("#FCA5A5", "#7F1D1D", "⏰", "Busy Morning Hot Water"),

  // Crown Premium Pasta — Jan through Aug
  p35: creative("#FDE68A", "#7C2D12", "🍝", "New Year New Recipes"),
  p36: creative("#FCD34D", "#78350F", "🕯️", "Valentine's Dinner"),
  p37: creative("#FBBF24", "#78350F", "⏱️", "Quick Meals"),
  p38: creative("#FDE68A", "#7C2D12", "🍽️", "Easter Family Feast"),
  p39: creative("#FCD34D", "#78350F", "🥄", "Easy Workers' Day Lunch"),
  p40: creative("#FBBF24", "#78350F", "🎉", "Family Cookout Favorite"),
  p41: creative("#FDE68A", "#7C2D12", "🌧️", "Rainy Day Comfort Bowl"),
  p42: creative("#FCD34D", "#78350F", "🎒", "Lunchbox Pasta Ideas"),
} as const;

export const seedClients: Client[] = [
  { id: "c-firstbank", name: "Firstbank", colorHex: "#0F4C81", initials: "FB" },
  { id: "c-kivo", name: "Kivo", colorHex: "#BE185D", initials: "KV" },
  { id: "c-ariston", name: "Ariston", colorHex: "#DC2626", initials: "AR" },
  { id: "c-crownpasta", name: "Crown Premium Pasta", colorHex: "#B45309", initials: "CP" },
];

export const seedPosts: Post[] = [
  {
    id: "p1",
    clientId: "c-firstbank",
    title: "Home Loan Rates Just Dropped",
    caption:
      "Good news, Naija! Our home loan rates just dropped — the perfect time to finally get that house in Lekki, Abuja, or wherever you've been eyeing. Speak to an advisor today and see how much you could save 🏡📉 #Firstbank #HomeLoans",
    platform: "Instagram",
    scheduledDate: isoDate(2),
    imageDataUrl: CARICATURES.p1,
    status: "in_review",
    createdAt: isoNow(180),
    updatedAt: isoNow(45),
  },
  {
    id: "p2",
    clientId: "c-firstbank",
    title: "5 Smart Saving Tips",
    caption: "Oya, let's talk savings 💰 Five simple habits to help your money grow faster this year — no long grammar, just results.",
    platform: "TikTok",
    scheduledDate: isoDate(4),
    imageDataUrl: CARICATURES.p2,
    status: "draft",
    createdAt: isoNow(60),
    updatedAt: isoNow(60),
  },
  {
    id: "p3",
    clientId: "c-firstbank",
    title: "Customer Success Story",
    caption:
      "\"Firstbank helped me open my business account in one afternoon — no long queue, no wahala.\" — Ngozi, small business owner, Port Harcourt 👏",
    platform: "Facebook",
    scheduledDate: isoDate(-1),
    imageDataUrl: CARICATURES.p3,
    status: "approved",
    createdAt: isoNow(4000),
    updatedAt: isoNow(1200),
  },
  {
    id: "p4",
    clientId: "c-kivo",
    title: "Glow Serum — New Bottle",
    caption:
      "New look, same glow ✨ Our best-selling Vitamin C serum just got a refresh — made for Lagos heat, humidity, and everything in between. Shop the link in bio.",
    platform: "Instagram",
    scheduledDate: isoDate(1),
    imageDataUrl: CARICATURES.p4,
    status: "changes_requested",
    createdAt: isoNow(500),
    updatedAt: isoNow(20),
  },
  {
    id: "p5",
    clientId: "c-kivo",
    title: "5-Step Routine Reel",
    caption: "Your new after-owambe skincare routine, in under 30 seconds 🌙✨",
    platform: "TikTok",
    scheduledDate: isoDate(3),
    imageDataUrl: CARICATURES.p5,
    status: "in_review",
    createdAt: isoNow(90),
    updatedAt: isoNow(90),
  },
  {
    id: "p6",
    clientId: "c-ariston",
    title: "New Water Heater Launch",
    caption:
      "Say goodbye to those cold harmattan mornings 🥶 Meet our most energy-efficient water heater yet — hot water anytime, less pressure on your light bill 🔥",
    platform: "Instagram",
    scheduledDate: isoDate(0),
    imageDataUrl: CARICATURES.p6,
    status: "in_review",
    createdAt: isoNow(300),
    updatedAt: isoNow(300),
  },
  {
    id: "p7",
    clientId: "c-ariston",
    title: "Harmattan Energy-Saving Tips",
    caption: "5 simple ways to cut your electricity bill this harmattan season, even with NEPA's unpredictable supply.",
    platform: "LinkedIn",
    scheduledDate: isoDate(6),
    imageDataUrl: CARICATURES.p7,
    status: "draft",
    createdAt: isoNow(20),
    updatedAt: isoNow(20),
  },
  {
    id: "p8",
    clientId: "c-crownpasta",
    title: "Sunday Jollof Swap",
    caption:
      "This Sunday, give the pot of jollof a small break and try a creamy Crown Premium Pasta bake instead 😋🍝 Your family will thank you. #SundayLunch #CrownPasta",
    platform: "Instagram",
    scheduledDate: isoDate(2),
    imageDataUrl: CARICATURES.p8,
    status: "in_review",
    createdAt: isoNow(240),
    updatedAt: isoNow(80),
  },
  {
    id: "p9",
    clientId: "c-crownpasta",
    title: "Behind the Pack",
    caption: "Ever wondered how we get that perfect al dente bite? Come see how Crown Premium Pasta is made, from our factory floor to your table 🍝",
    platform: "TikTok",
    scheduledDate: isoDate(5),
    imageDataUrl: CARICATURES.p9,
    status: "draft",
    createdAt: isoNow(50),
    updatedAt: isoNow(50),
  },
  {
    id: "p10",
    clientId: "c-crownpasta",
    title: "Tag the Pot Finisher",
    caption: "Tag the person in your house who always finishes the pot first and still asks 'is there more?' 😅🍝 #CrownPremiumPasta",
    platform: "Facebook",
    scheduledDate: isoDate(-2),
    imageDataUrl: CARICATURES.p10,
    status: "changes_requested",
    createdAt: isoNow(600),
    updatedAt: isoNow(15),
  },

  // ---- Monthly content calendar: January through last month, 1 post per ----
  // ---- brand per month, already published so all are "approved". --------

  // Firstbank
  {
    id: "p11",
    clientId: "c-firstbank",
    title: "New Year, New Goals",
    caption: "2026 is here — let's make it your best financial year yet. Open a savings plan today and watch your goals come alive 🎯💰 #Firstbank #NewYearNewGoals",
    platform: "Instagram",
    scheduledDate: monthDate(1, 8),
    imageDataUrl: CARICATURES.p11,
    status: "approved",
    createdAt: monthDate(1, 3) + "T09:00:00.000Z",
    updatedAt: monthDate(1, 6) + "T09:00:00.000Z",
  },
  {
    id: "p12",
    clientId: "c-firstbank",
    title: "Love & Money",
    caption: "This Valentine's, why not open a joint account with bae? Saving together, growing together 💛 #Firstbank #ValentinesDay",
    platform: "Facebook",
    scheduledDate: monthDate(2, 14),
    imageDataUrl: CARICATURES.p12,
    status: "approved",
    createdAt: monthDate(2, 10) + "T09:00:00.000Z",
    updatedAt: monthDate(2, 12) + "T09:00:00.000Z",
  },
  {
    id: "p13",
    clientId: "c-firstbank",
    title: "Women Who Save",
    caption: "To every woman building her empire — our Women's Month savings plan comes with zero account maintenance fees. You've earned it 👑 #InternationalWomensDay",
    platform: "Instagram",
    scheduledDate: monthDate(3, 8),
    imageDataUrl: CARICATURES.p13,
    status: "approved",
    createdAt: monthDate(3, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(3, 6) + "T09:00:00.000Z",
  },
  {
    id: "p14",
    clientId: "c-firstbank",
    title: "Easter Getaway Loan",
    caption: "Planning an Easter trip to see family? Our quick-access travel loan has you covered, no long paperwork 🐣✈️ #Firstbank #EasterWithFamily",
    platform: "Facebook",
    scheduledDate: monthDate(4, 4),
    imageDataUrl: CARICATURES.p14,
    status: "approved",
    createdAt: monthDate(4, 1) + "T09:00:00.000Z",
    updatedAt: monthDate(4, 2) + "T09:00:00.000Z",
  },
  {
    id: "p15",
    clientId: "c-firstbank",
    title: "Salary Account Perks",
    caption: "Happy Workers' Day! Every hardworking Nigerian deserves a salary account that works as hard as they do 💼🙌 #WorkersDay",
    platform: "LinkedIn",
    scheduledDate: monthDate(5, 1),
    imageDataUrl: CARICATURES.p15,
    status: "approved",
    createdAt: monthDate(4, 28) + "T09:00:00.000Z",
    updatedAt: monthDate(4, 29) + "T09:00:00.000Z",
  },
  {
    id: "p16",
    clientId: "c-firstbank",
    title: "Mid-Year Money Checkup",
    caption: "Halfway through the year — how are your finances looking? Book a free mid-year money checkup with an advisor 📊 #Firstbank #DemocracyDay",
    platform: "Instagram",
    scheduledDate: monthDate(6, 12),
    imageDataUrl: CARICATURES.p16,
    status: "approved",
    createdAt: monthDate(6, 8) + "T09:00:00.000Z",
    updatedAt: monthDate(6, 10) + "T09:00:00.000Z",
  },
  {
    id: "p17",
    clientId: "c-firstbank",
    title: "Grow Your Naira",
    caption: "Your money should be working even while you sleep. Here's how our high-yield savings plan grows your Naira 🌱💤",
    platform: "TikTok",
    scheduledDate: monthDate(7, 15),
    imageDataUrl: CARICATURES.p17,
    status: "approved",
    createdAt: monthDate(7, 11) + "T09:00:00.000Z",
    updatedAt: monthDate(7, 13) + "T09:00:00.000Z",
  },
  {
    id: "p18",
    clientId: "c-firstbank",
    title: "Back-to-School Fees Support",
    caption: "New session, new fees. Our School Fees Support Plan spreads the cost so September doesn't hit so hard 🎒📚 #Firstbank",
    platform: "Facebook",
    scheduledDate: monthDate(8, 25),
    imageDataUrl: CARICATURES.p18,
    status: "approved",
    createdAt: monthDate(8, 21) + "T09:00:00.000Z",
    updatedAt: monthDate(8, 23) + "T09:00:00.000Z",
  },

  // Kivo
  {
    id: "p19",
    clientId: "c-kivo",
    title: "New Year Skin Reset",
    caption: "New year, fresh glow. Reset your skincare routine with our Vitamin C starter set ✨ #Kivo #NewYearNewSkin",
    platform: "Instagram",
    scheduledDate: monthDate(1, 8),
    imageDataUrl: CARICATURES.p19,
    status: "approved",
    createdAt: monthDate(1, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(1, 6) + "T09:00:00.000Z",
  },
  {
    id: "p20",
    clientId: "c-kivo",
    title: "Glow For Your Date",
    caption: "Date night ready in 3 steps. Get that Valentine's glow with our mini routine set 💋✨ #Kivo #ValentinesGlow",
    platform: "Instagram",
    scheduledDate: monthDate(2, 14),
    imageDataUrl: CARICATURES.p20,
    status: "approved",
    createdAt: monthDate(2, 10) + "T09:00:00.000Z",
    updatedAt: monthDate(2, 12) + "T09:00:00.000Z",
  },
  {
    id: "p21",
    clientId: "c-kivo",
    title: "Self-Care Is Self-Respect",
    caption: "This Women's Month, we're celebrating every woman who makes time for herself. Treat your skin, you deserve it 🌸 #InternationalWomensDay",
    platform: "Facebook",
    scheduledDate: monthDate(3, 8),
    imageDataUrl: CARICATURES.p21,
    status: "approved",
    createdAt: monthDate(3, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(3, 6) + "T09:00:00.000Z",
  },
  {
    id: "p22",
    clientId: "c-kivo",
    title: "Easter Skin Refresh",
    caption: "Long Easter weekend, longer glow. Pack our travel-size set for your trip and keep your skin fresh on the go 🐣",
    platform: "Instagram",
    scheduledDate: monthDate(4, 4),
    imageDataUrl: CARICATURES.p22,
    status: "approved",
    createdAt: monthDate(4, 1) + "T09:00:00.000Z",
    updatedAt: monthDate(4, 2) + "T09:00:00.000Z",
  },
  {
    id: "p23",
    clientId: "c-kivo",
    title: "Rainy Season Prep",
    caption: "Rainy season is knocking — time to swap that heavy cream for something lighter. Here's our May skin routine 🌧️",
    platform: "TikTok",
    scheduledDate: monthDate(5, 6),
    imageDataUrl: CARICATURES.p23,
    status: "approved",
    createdAt: monthDate(5, 2) + "T09:00:00.000Z",
    updatedAt: monthDate(5, 4) + "T09:00:00.000Z",
  },
  {
    id: "p24",
    clientId: "c-kivo",
    title: "Mid-Year Glow Check",
    caption: "Six months in — how's your skin holding up? Time for a mid-year glow check and routine refresh 🪞✨",
    platform: "Instagram",
    scheduledDate: monthDate(6, 18),
    imageDataUrl: CARICATURES.p24,
    status: "approved",
    createdAt: monthDate(6, 14) + "T09:00:00.000Z",
    updatedAt: monthDate(6, 16) + "T09:00:00.000Z",
  },
  {
    id: "p25",
    clientId: "c-kivo",
    title: "Sun Protection, Always",
    caption: "Cloudy days still need SPF! Don't let the rainy season fool you — protect that glow every single day ☀️",
    platform: "Facebook",
    scheduledDate: monthDate(7, 20),
    imageDataUrl: CARICATURES.p25,
    status: "approved",
    createdAt: monthDate(7, 16) + "T09:00:00.000Z",
    updatedAt: monthDate(7, 18) + "T09:00:00.000Z",
  },
  {
    id: "p26",
    clientId: "c-kivo",
    title: "Prep for Resumption",
    caption: "School resumption is around the corner — stock up on the essentials before the September rush 🎒✨ #Kivo",
    platform: "Instagram",
    scheduledDate: monthDate(8, 25),
    imageDataUrl: CARICATURES.p26,
    status: "approved",
    createdAt: monthDate(8, 21) + "T09:00:00.000Z",
    updatedAt: monthDate(8, 23) + "T09:00:00.000Z",
  },

  // Ariston
  {
    id: "p27",
    clientId: "c-ariston",
    title: "New Year Home Upgrade",
    caption: "Start the year right with a home upgrade. New year, new water heater, better mornings 🏠🔥 #Ariston #NewYear",
    platform: "Instagram",
    scheduledDate: monthDate(1, 8),
    imageDataUrl: CARICATURES.p27,
    status: "approved",
    createdAt: monthDate(1, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(1, 6) + "T09:00:00.000Z",
  },
  {
    id: "p28",
    clientId: "c-ariston",
    title: "Warm Baths For Two",
    caption: "This Valentine's, let's talk warm baths, not just flowers 🛁💕 Treat your home to reliable hot water #Ariston",
    platform: "Facebook",
    scheduledDate: monthDate(2, 14),
    imageDataUrl: CARICATURES.p28,
    status: "approved",
    createdAt: monthDate(2, 10) + "T09:00:00.000Z",
    updatedAt: monthDate(2, 12) + "T09:00:00.000Z",
  },
  {
    id: "p29",
    clientId: "c-ariston",
    title: "Comfort For Every Home",
    caption: "To the women who keep our homes running — this Women's Month, we see you. Comfort starts with reliable hot water 🏡 #InternationalWomensDay",
    platform: "Instagram",
    scheduledDate: monthDate(3, 8),
    imageDataUrl: CARICATURES.p29,
    status: "approved",
    createdAt: monthDate(3, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(3, 6) + "T09:00:00.000Z",
  },
  {
    id: "p30",
    clientId: "c-ariston",
    title: "Travel Safe This Easter",
    caption: "Traveling for Easter? Remember to switch off appliances before you leave. Safety first, always 🧳🔌 #Ariston",
    platform: "Facebook",
    scheduledDate: monthDate(4, 4),
    imageDataUrl: CARICATURES.p30,
    status: "approved",
    createdAt: monthDate(4, 1) + "T09:00:00.000Z",
    updatedAt: monthDate(4, 2) + "T09:00:00.000Z",
  },
  {
    id: "p31",
    clientId: "c-ariston",
    title: "Mid-Year Maintenance Check",
    caption: "When last did you service your water heater? A quick mid-year check now saves you a breakdown later 🔧",
    platform: "LinkedIn",
    scheduledDate: monthDate(5, 20),
    imageDataUrl: CARICATURES.p31,
    status: "approved",
    createdAt: monthDate(5, 16) + "T09:00:00.000Z",
    updatedAt: monthDate(5, 18) + "T09:00:00.000Z",
  },
  {
    id: "p32",
    clientId: "c-ariston",
    title: "Rainy Season Power Safety",
    caption: "Rainy season means more power surges. Here's how to protect your appliances this June ⛈️🔌 #Ariston",
    platform: "Instagram",
    scheduledDate: monthDate(6, 15),
    imageDataUrl: CARICATURES.p32,
    status: "approved",
    createdAt: monthDate(6, 11) + "T09:00:00.000Z",
    updatedAt: monthDate(6, 13) + "T09:00:00.000Z",
  },
  {
    id: "p33",
    clientId: "c-ariston",
    title: "Beat the Rainy Chill",
    caption: "Rainy mornings hit different when you've got instant hot water waiting for you ☔🚿 #Ariston",
    platform: "TikTok",
    scheduledDate: monthDate(7, 22),
    imageDataUrl: CARICATURES.p33,
    status: "approved",
    createdAt: monthDate(7, 18) + "T09:00:00.000Z",
    updatedAt: monthDate(7, 20) + "T09:00:00.000Z",
  },
  {
    id: "p34",
    clientId: "c-ariston",
    title: "Hot Water For Busy Mornings",
    caption: "New term, new school run madness. Our water heaters keep up with your busiest mornings ⏰🚿 #Ariston",
    platform: "Instagram",
    scheduledDate: monthDate(8, 25),
    imageDataUrl: CARICATURES.p34,
    status: "approved",
    createdAt: monthDate(8, 21) + "T09:00:00.000Z",
    updatedAt: monthDate(8, 23) + "T09:00:00.000Z",
  },

  // Crown Premium Pasta
  {
    id: "p35",
    clientId: "c-crownpasta",
    title: "New Year, New Recipes",
    caption: "New year, new meals! Kick off 2026 with 5 quick Crown Premium Pasta recipes for busy weeknights 🍝 #CrownPasta",
    platform: "Instagram",
    scheduledDate: monthDate(1, 8),
    imageDataUrl: CARICATURES.p35,
    status: "approved",
    createdAt: monthDate(1, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(1, 6) + "T09:00:00.000Z",
  },
  {
    id: "p36",
    clientId: "c-crownpasta",
    title: "Valentine's Dinner for Two",
    caption: "Skip the reservation — cook a Valentine's dinner they'll never forget with Crown Premium Pasta 🕯️🍝 #ValentinesDay",
    platform: "Facebook",
    scheduledDate: monthDate(2, 14),
    imageDataUrl: CARICATURES.p36,
    status: "approved",
    createdAt: monthDate(2, 10) + "T09:00:00.000Z",
    updatedAt: monthDate(2, 12) + "T09:00:00.000Z",
  },
  {
    id: "p37",
    clientId: "c-crownpasta",
    title: "Quick Meals for Busy Women",
    caption: "This Women's Month, we're making dinner the easy part. 15-minute Crown Premium Pasta meals for the woman on the go ⏱️🍝",
    platform: "Instagram",
    scheduledDate: monthDate(3, 8),
    imageDataUrl: CARICATURES.p37,
    status: "approved",
    createdAt: monthDate(3, 4) + "T09:00:00.000Z",
    updatedAt: monthDate(3, 6) + "T09:00:00.000Z",
  },
  {
    id: "p38",
    clientId: "c-crownpasta",
    title: "Easter Family Feast",
    caption: "Gathering the family this Easter? A big bowl of Crown Premium Pasta always brings everyone to the table 🍽️🐣",
    platform: "Facebook",
    scheduledDate: monthDate(4, 4),
    imageDataUrl: CARICATURES.p38,
    status: "approved",
    createdAt: monthDate(4, 1) + "T09:00:00.000Z",
    updatedAt: monthDate(4, 2) + "T09:00:00.000Z",
  },
  {
    id: "p39",
    clientId: "c-crownpasta",
    title: "Easy Workers' Day Lunch",
    caption: "You worked hard, now let dinner be easy. Crown Premium Pasta, ready in minutes 🥄 #WorkersDay",
    platform: "TikTok",
    scheduledDate: monthDate(5, 1),
    imageDataUrl: CARICATURES.p39,
    status: "approved",
    createdAt: monthDate(4, 28) + "T09:00:00.000Z",
    updatedAt: monthDate(4, 29) + "T09:00:00.000Z",
  },
  {
    id: "p40",
    clientId: "c-crownpasta",
    title: "Family Cookout Favorite",
    caption: "Democracy Day cookout? Crown Premium Pasta salad is the dish that disappears first 🎉🍝",
    platform: "Instagram",
    scheduledDate: monthDate(6, 12),
    imageDataUrl: CARICATURES.p40,
    status: "approved",
    createdAt: monthDate(6, 8) + "T09:00:00.000Z",
    updatedAt: monthDate(6, 10) + "T09:00:00.000Z",
  },
  {
    id: "p41",
    clientId: "c-crownpasta",
    title: "Rainy Day Comfort Bowl",
    caption: "Nothing beats a warm bowl of pasta on a rainy Lagos evening. Comfort food, sorted 🌧️🍝",
    platform: "Facebook",
    scheduledDate: monthDate(7, 15),
    imageDataUrl: CARICATURES.p41,
    status: "approved",
    createdAt: monthDate(7, 11) + "T09:00:00.000Z",
    updatedAt: monthDate(7, 13) + "T09:00:00.000Z",
  },
  {
    id: "p42",
    clientId: "c-crownpasta",
    title: "Lunchbox Pasta Ideas",
    caption: "September resumption is close — stock up on easy lunchbox pasta ideas the kids will actually eat 🎒🍝 #CrownPasta",
    platform: "Instagram",
    scheduledDate: monthDate(8, 25),
    imageDataUrl: CARICATURES.p42,
    status: "approved",
    createdAt: monthDate(8, 21) + "T09:00:00.000Z",
    updatedAt: monthDate(8, 23) + "T09:00:00.000Z",
  },
];

export const seedComments: Comment[] = [
  {
    id: "cm1",
    postId: "p1",
    authorName: "Priya (Social Team)",
    authorRole: "agency",
    text: "First pass on the home loan rates post — let us know if the CTA feels strong enough!",
    createdAt: isoNow(170),
  },
  {
    id: "cm2",
    postId: "p1",
    authorName: "Alex (Firstbank)",
    authorRole: "client",
    text: "Looks good. Can we add the current APR figure directly in the caption instead of just 'went down'?",
    createdAt: isoNow(50),
  },
  {
    id: "cm3",
    postId: "p4",
    authorName: "Priya (Social Team)",
    authorRole: "agency",
    text: "Here's the refreshed bottle shot for the relaunch post.",
    createdAt: isoNow(400),
  },
  {
    id: "cm4",
    postId: "p4",
    authorName: "Morgan (Kivo)",
    authorRole: "client",
    text: "The bottle looks great, but can we use the matte background version instead of glossy? It reads truer to our packaging.",
    createdAt: isoNow(25),
  },
  {
    id: "cm5",
    postId: "p10",
    authorName: "Priya (Social Team)",
    authorRole: "agency",
    text: "Here's the pot-finisher post for review — thought this concept would get good engagement 😄",
    createdAt: isoNow(590),
  },
  {
    id: "cm6",
    postId: "p10",
    authorName: "Emeka (Crown Premium Pasta)",
    authorRole: "client",
    text: "Funny concept! Can we swap 'is there more?' for 'abeg, still get?' — feels more natural for our audience.",
    createdAt: isoNow(14),
  },
];
