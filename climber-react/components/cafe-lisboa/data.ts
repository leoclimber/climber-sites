// Conteúdo do site. Fica separado dos componentes de propósito (PARTE 11
// do documento mestre) — trocar um preço ou horário é editar um valor
// aqui, não mexer em JSX.

export const business = {
  name: "Café Lisboa",
  addressLine: "14 Meath Street, Dublin 8, D08 X2N1",
  phoneDisplay: "+353 1 234 5678",
  phoneHref: "tel:+35312345678",
  instagramHandle: "@cafelisboa_dublin",
  instagramHref: "https://instagram.com/cafelisboa_dublin",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=14+Meath+Street%2C+Dublin+8%2C+D08+X2N1",
  establishedYear: 2019,
};

export const hours = [
  { day: "Mon – Fri", range: "07:00 – 17:00", openMin: 7 * 60, closeMin: 17 * 60 },
  { day: "Sat", range: "08:00 – 17:00", openMin: 8 * 60, closeMin: 17 * 60 },
  { day: "Sun", range: "09:00 – 16:00", openMin: 9 * 60, closeMin: 16 * 60 },
];

type MenuItem = { name: string; price: string; allergens?: string[] };

export const menuCategories: { id: string; label: string; items: MenuItem[] }[] = [
  {
    id: "coffee",
    label: "Coffee",
    items: [
      { name: "Flat white", price: "4.20" },
      { name: "Filter, single origin", price: "4.50" },
      { name: "Cortado", price: "3.80" },
      { name: "Pour over, house blend", price: "4.80" },
    ],
  },
  {
    id: "pastries",
    label: "Pastries",
    items: [
      { name: "Pain au chocolat", price: "3.60", allergens: ["G"] },
      { name: "Carrot cake", price: "4.90", allergens: ["G", "N"] },
      { name: "Scone, seasonal jam", price: "3.40", allergens: ["G", "D"] },
    ],
  },
  {
    id: "toasted",
    label: "Toasted",
    items: [
      { name: "Avocado on sourdough", price: "8.90", allergens: ["G"] },
      { name: "Toastie, ham & cheese", price: "6.50", allergens: ["G", "D"] },
    ],
  },
  {
    id: "cold",
    label: "Cold",
    items: [
      { name: "Iced latte", price: "4.60" },
      { name: "Cold brew", price: "4.30" },
    ],
  },
];

export const allergenLegend = "G Gluten · N Nuts · D Dairy";

export const allergenDeclaration =
  "Full allergen declaration (14): celery, gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, nuts, peanuts, sesame, soybeans, sulphites — ask your server.";

export const routineSteps = [
  {
    label: "Bean",
    lines: [
      "Arrives green from a single farm in Minas Gerais.",
      "Roasted here in 12kg batches, every Tuesday.",
      "Rested 48 hours before it's ground.",
    ],
    mobileLines: ["Roasted here weekly, 12kg batches.", "Rested 48 hours before grinding."],
    image: "/images/gallery/1.jpg",
  },
  {
    label: "Method",
    lines: [
      "Filtered through a V60, one cup at a time.",
      "Water at 94°C, three minutes per pour.",
      "No batch brew, ever, after ten.",
    ],
    mobileLines: ["V60, one cup at a time.", "94°C, three minutes per pour."],
    image: "/images/gallery/sobre.jpg",
  },
  {
    label: "Cup",
    lines: [
      "Served in stoneware fired in Stoneybatter.",
      "Holds heat twice as long as standard ceramic.",
      "Yours to keep at the table — no rush.",
    ],
    mobileLines: ["Stoneware fired in Stoneybatter.", "Holds heat twice as long."],
    image: "/images/gallery/4.jpg",
  },
];

export const reviews = [
  { quote: "Best flat white south of the Liffey.", author: "Aoife" },
  { quote: "The kind of café you plan your morning around.", author: "Marcus" },
  { quote: "Quiet, unhurried — exactly what Meath Street needed.", author: "Niamh" },
];

export const mosaicSlots = [
  { id: "A", src: "/images/gallery/atmosphere-04.jpg", alt: "The counter and shelves at Café Lisboa, morning light through the window", ratio: 3 / 2 },
  { id: "B", src: "/images/gallery/detail-04.jpg", alt: "Stacked ceramic cups and saucers on the counter", ratio: 3584 / 4608 },
  { id: "C", src: "/images/gallery/product-01.jpg", alt: "Cappuccino with latte art, steam rising, spoon and napkin beside it", ratio: 1 },
  { id: "D", src: "/images/gallery/atmosphere-03.jpg", alt: "Reading corner with a leather armchair and marble table", ratio: 3 / 2 },
  { id: "E", src: "/images/gallery/facade-vertical.jpg", alt: "Café Lisboa's green shopfront at dusk", ratio: 3584 / 4608 },
] as const;
