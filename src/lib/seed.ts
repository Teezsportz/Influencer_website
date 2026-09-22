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

// AI-generated caricature/illustrated creatives, one per seeded post.
// Swap for a real upload any time via the editor's "Creative" field.
const CARICATURES = {
  p1: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_3c1c4f48-1abc-4848-b713-aec4f4da69e8.png",
  p2: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_87667102-717e-4f31-8862-cee9d5e282ac.png",
  p3: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_7326d153-f7f2-4e4b-a10e-7f4a2f0d575a.png",
  p4: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_24879d3c-d346-4c13-b45a-dcbfbfe43edf.png",
  p5: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_7f50e149-15b2-4648-b680-f5adcd69ce3e.png",
  p6: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102057_cbc31df5-9048-473c-96b1-f34594681e3c.png",
  p7: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_6a9e9ebc-5f7a-4389-be3b-2f0ff70518c0.png",
  p8: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_17a8cc65-db5d-4fd6-a047-84fa3f6c160d.png",
  p9: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102056_daa7db96-c5a8-47f2-b88b-f8e8c8047975.png",
  p10: "https://d8j0ntlcm91z4.cloudfront.net/user_3H8G4sc5yYK7dAUw19zZgHmsJuj/hf_20260922_102055_9e761c43-9481-4058-aecf-c5af1a703b7c.png",
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
