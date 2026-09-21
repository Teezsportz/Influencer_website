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

// 1x1-ish soft-colored placeholder creatives so the board looks real without
// shipping binary assets in the repo. Swap for real uploads via the editor.
function placeholder(bg: string, fg: string, label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
    <rect width='600' height='600' fill='${bg}'/>
    <text x='50%' y='50%' font-family='Inter, sans-serif' font-size='42' font-weight='600'
      fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const seedClients: Client[] = [
  { id: "c-firstbank", name: "Firstbank", colorHex: "#0F4C81", initials: "FB" },
  { id: "c-kivo", name: "Kivo", colorHex: "#BE185D", initials: "KV" },
  { id: "c-ariston", name: "Ariston", colorHex: "#DC2626", initials: "AR" },
];

export const seedPosts: Post[] = [
  {
    id: "p1",
    clientId: "c-firstbank",
    title: "Home Loan Rates Just Dropped",
    caption:
      "Great news for first-time buyers — our home loan rates just went down. Speak to an advisor today and see how much you could save 🏡📉 #Firstbank #HomeLoans",
    platform: "Instagram",
    scheduledDate: isoDate(2),
    imageDataUrl: placeholder("#DBEAFE", "#0F4C81", "Home Loan Rates"),
    status: "in_review",
    createdAt: isoNow(180),
    updatedAt: isoNow(45),
  },
  {
    id: "p2",
    clientId: "c-firstbank",
    title: "5 Smart Saving Tips",
    caption:
      "Small habits, big savings. Here are 5 quick tips to grow your savings account faster this year 💰",
    platform: "TikTok",
    scheduledDate: isoDate(4),
    imageDataUrl: placeholder("#BFDBFE", "#0F4C81", "Saving Tips"),
    status: "draft",
    createdAt: isoNow(60),
    updatedAt: isoNow(60),
  },
  {
    id: "p3",
    clientId: "c-firstbank",
    title: "Customer Success Story",
    caption: "\"Firstbank helped me open my first business account in under 10 minutes.\" — Tunde, small business owner 👏",
    platform: "Facebook",
    scheduledDate: isoDate(-1),
    imageDataUrl: placeholder("#93C5FD", "#0F4C81", "Customer Story"),
    status: "approved",
    createdAt: isoNow(4000),
    updatedAt: isoNow(1200),
  },
  {
    id: "p4",
    clientId: "c-kivo",
    title: "Glow Serum — New Bottle",
    caption:
      "New look, same glow. Our best-selling Vitamin C serum just got a refresh ✨ Shop the link in bio.",
    platform: "Instagram",
    scheduledDate: isoDate(1),
    imageDataUrl: placeholder("#FBCFE8", "#831843", "Glow Serum"),
    status: "changes_requested",
    createdAt: isoNow(500),
    updatedAt: isoNow(20),
  },
  {
    id: "p5",
    clientId: "c-kivo",
    title: "5-Step Routine Reel",
    caption: "Your new nighttime routine, in under 30 seconds 🌙",
    platform: "TikTok",
    scheduledDate: isoDate(3),
    imageDataUrl: placeholder("#F9A8D4", "#831843", "5-Step Routine"),
    status: "in_review",
    createdAt: isoNow(90),
    updatedAt: isoNow(90),
  },
  {
    id: "p6",
    clientId: "c-ariston",
    title: "New Water Heater Launch",
    caption: "Meet our most energy-efficient water heater yet — hot water, half the running cost 🔥",
    platform: "Instagram",
    scheduledDate: isoDate(0),
    imageDataUrl: placeholder("#FECACA", "#7F1D1D", "New Water Heater"),
    status: "in_review",
    createdAt: isoNow(300),
    updatedAt: isoNow(300),
  },
  {
    id: "p7",
    clientId: "c-ariston",
    title: "Winter Energy-Saving Tips",
    caption: "5 ways to cut your heating bill this winter without sacrificing comfort.",
    platform: "LinkedIn",
    scheduledDate: isoDate(6),
    imageDataUrl: placeholder("#FCA5A5", "#7F1D1D", "Energy-Saving Tips"),
    status: "draft",
    createdAt: isoNow(20),
    updatedAt: isoNow(20),
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
];
