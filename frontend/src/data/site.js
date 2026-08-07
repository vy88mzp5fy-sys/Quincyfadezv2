export const LINKS = {
  booking: "https://www.barbr.me/quincyfadez",
  instagram: "https://www.instagram.com/QuincyFadez",
  whatsapp: "https://wa.me/447490194682",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434",
  address: "8 Gillians Way, Oxford OX4 2YD",
};

export const PROFILE_IMG =
  "https://barbr-assets-prod.b-cdn.net/media/user/583640/barber_profile/2ae04014_profile-1785752577750.png";

export const MAP_IMG =
  "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+ffffff(-1.2202434,51.7402247)/-1.2202434,51.7402247,14.5/900x700@2x?access_token=MAPBOX_TOKEN_REMOVED";

const CDN = "https://vz-d1735d3f-314.b-cdn.net";
const MEDIA_IDS = [
  "618cf253-dad5-4c95-9260-22be4fe31719",
  "8656d667-9c99-4d1b-b20b-bf8f1b2ec44c",
  "ed50b0aa-31d1-4496-925f-35cf0b30f816",
  "6fc2a989-2f95-40a9-ae35-83223a93f16f",
  "30f766a7-d30f-4abd-aa77-7729f26d27a4",
  "534917f9-0536-445d-a979-82f12cafcd75",
];

export const GALLERY = MEDIA_IDS.map((id) => ({
  thumb: `${CDN}/${id}/thumbnail.jpg`,
  video: `${CDN}/${id}/play_720p.mp4`,
}));

export const SERVICES = [
  {
    name: "Haircut",
    price: "£20",
    desc: "Any cut you want — skin fades, tapers and clean scissor work, finished sharp.",
    duration: "45 min",
  },
  {
    name: "Haircut & Beard",
    price: "£25",
    desc: "A full cut paired with a sharp, lined-up beard trim.",
    duration: "60 min",
  },
  {
    name: "Shape Up",
    price: "£10",
    desc: "A quick refresh — crisp lines and edges, no full trim.",
    duration: "15 min",
  },
  {
    name: "Beard Trim",
    price: "£10",
    desc: "Beard groomed, shaped and lined to finish clean.",
    duration: "15 min",
  },
];

export const MEMBERSHIP = {
  name: "VIP x4",
  price: "£64",
  cadence: "/ month",
  benefits: [
    "Up to 4 haircuts each month",
    "7-day cooldown between bookings",
    "Renews every 30 days · cancel anytime",
  ],
};

export const HOURS = [
  { day: "Monday", time: "17:45 – 22:00" },
  { day: "Tuesday", time: "17:45 – 22:00" },
  { day: "Wednesday", time: "17:45 – 22:00" },
  { day: "Thursday", time: "17:45 – 22:00" },
  { day: "Friday", time: "Closed" },
  { day: "Saturday", time: "09:00 – 12:00" },
  { day: "Sunday", time: "Closed" },
];

export const CHAPTERS = [
  {
    no: "01",
    title: "The Vision Came First",
    body: "Hooked On The Craft Long Before I Ever Held A Pair Of Clippers — The Shapes, The Lines, The Finish. The Eye Came First.",
  },
  {
    no: "02",
    title: "Self-Taught Since 2022",
    body: "Self-Taught From Day One In 2022. No Shortcuts — Just Reps, Week After Week, Getting Sharper Every Time.",
  },
  {
    no: "03",
    title: "25 · Oxford · All In",
    body: "25 And Oxford-Based. You Leave Looking Your Best, Every Single Time. This Isn't A Job — It's The Craft I Love.",
  },
];
