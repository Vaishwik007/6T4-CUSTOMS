export const SITE_INFO = {
  name: "6T4 Customs",
  tagline: "Built Different. Tuned Brutal.",
  phone: "+91 98490 00000",         // placeholder — owner to update
  whatsapp: process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "+919849000000",
  email: "garage@6t4customs.com",  // placeholder — owner to update
  address: {
    street: "Plot 42, Nizampet Road",
    area: "Bachupally",
    city: "Hyderabad",
    state: "Telangana",
    pin: "500090",
    country: "India",
    full: "Plot 42, Nizampet Road, Bachupally, Hyderabad, Telangana 500090"
  },
  hours: {
    weekdays: "Mon–Sat: 9:00 AM – 7:00 PM",
    weekend: "Sunday: Closed",
    note: "Appointment preferred for service jobs."
  },
  social: {
    instagram: "https://www.instagram.com/6t4customs",
    youtube: "https://www.youtube.com/@6t4customs",
    facebook: "https://www.facebook.com/6t4customs"
  },
  maps: "https://maps.google.com/?q=6T4+Customs+Bachupally+Hyderabad",
  founded: 2012,
} as const;

export function getWhatsAppLink(message: string): string {
  const num = SITE_INFO.whatsapp.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
