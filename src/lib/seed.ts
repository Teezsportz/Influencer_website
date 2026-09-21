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
  { id: "c-northwind", name: "Northwind Coffee Co.", colorHex: "#B45309", initials: "NC" },
  { id: "c-luma", name: "Luma Skincare", colorHex: "#BE185D", initials: "LS" },
  { id: "c-fenix", name: "Fenix Fitness", colorHex: "#1D4ED8", initials: "FF" },
];

export const seedPosts: Post[] = [
  {
    id: "p1",
    clientId: "c-northwind",
    title: "Autumn Latte Launch",
    caption:
      "Pumpkin spice is back — and better than ever. Swing by this weekend and try our new Autumn Harvest Latte ☕️🍂 #NorthwindCoffee #FallFlavors",
    platform: "Instagram",
    scheduledDate: isoDate(2),
    imageDataUrl: placeholder("#FDE68A", "#7C2D12", "Autumn Latte"),
    status: "in_review",
    createdAt: isoNow(180),
    updatedAt: isoNow(45),
  },
  {
    id: "p2",
    clientId: "c-northwind",
    title: "Behind the Roast",
    caption:
      "Ever wonder how we get that rich, smoky flavor? Take a peek behind the scenes at our roastery 🌰",
    platform: "TikTok",
    scheduledDate: isoDate(4),
    imageDataUrl: placeholder("#FCD34D", "#78350F", "Behind the Roast"),
    status: "draft",
    createdAt: isoNow(60),
    updatedAt: isoNow(60),
  },
  {
    id: "p3",
    clientId: "c-northwind",
    title: "Customer Shoutout",
    caption: "Tag someone who needs their coffee fix right now 👇",
    platform: "Facebook",
    scheduledDate: isoDate(-1),
    imageDataUrl: placeholder("#FBBF24", "#78350F", "Customer Shoutout"),
    status: "approved",
    createdAt: isoNow(4000),
    updatedAt: isoNow(1200),
  },
  {
    id: "p4",
    clientId: "c-luma",
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
    clientId: "c-luma",
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
    clientId: "c-fenix",
    title: "Member Transformation — Jamie",
    caption: "12 weeks, one incredible transformation. So proud of you, Jamie! 💪",
    platform: "Instagram",
    scheduledDate: isoDate(0),
    imageDataUrl: placeholder("#BFDBFE", "#1E3A8A", "Jamie's Story"),
    status: "in_review",
    createdAt: isoNow(300),
    updatedAt: isoNow(300),
  },
  {
    id: "p7",
    clientId: "c-fenix",
    title: "New Year Membership Push",
    caption: "Founding member pricing ends Friday. Lock in your rate before it's gone.",
    platform: "LinkedIn",
    scheduledDate: isoDate(6),
    imageDataUrl: placeholder("#93C5FD", "#1E3A8A", "Founding Rate"),
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
    text: "First pass on the Autumn Latte post — let us know if the CTA feels strong enough!",
    createdAt: isoNow(170),
  },
  {
    id: "cm2",
    postId: "p1",
    authorName: "Alex (Northwind)",
    authorRole: "client",
    text: "Love the photo. Can we swap 'swing by' for 'stop in' to match our brand voice?",
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
    authorName: "Morgan (Luma)",
    authorRole: "client",
    text: "The bottle looks great, but can we use the matte background version instead of glossy? It reads truer to our packaging.",
    createdAt: isoNow(25),
  },
];
