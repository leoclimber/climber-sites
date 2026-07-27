// Conteúdo do site. Fica separado dos componentes de propósito (PARTE 11
// do documento mestre) — trocar um preço ou horário é editar um valor
// aqui, não mexer em JSX.

export const business = {
  name: "Café Lisboa",
  addressLine: "14 Meath Street, Dublin 8, D08 X2N1",
  addressShort: "14 Meath Street, Dublin 8",
  phoneDisplay: "+353 1 234 5678",
  phoneHref: "tel:+35312345678",
  instagramHandle: "@cafelisboa_dublin",
  instagramHref: "https://instagram.com/cafelisboa_dublin",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=14+Meath+Street%2C+Dublin+8%2C+D08+X2N1",
  establishedYear: 2019,
  rating: 4.8,
  reviewCount: 503,
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
      { name: "Espresso", price: "3.20" },
      { name: "Cappuccino", price: "4.00" },
      { name: "Mocha", price: "4.60" },
      { name: "Iced americano", price: "4.00" },
    ],
  },
  {
    id: "pastries",
    label: "Pastries",
    items: [
      { name: "Butter croissant", price: "3.20", allergens: ["G", "D"] },
      { name: "Pain au chocolat", price: "3.60", allergens: ["G", "D"] },
      { name: "Almond croissant", price: "3.80", allergens: ["G", "D", "N"] },
      { name: "Cinnamon bun", price: "3.90", allergens: ["G", "D"] },
      { name: "Banana bread", price: "3.50", allergens: ["G", "D", "N"] },
      { name: "Scone, seasonal jam", price: "3.40", allergens: ["G", "D"] },
    ],
  },
  {
    id: "toasted",
    label: "Toasted",
    items: [
      { name: "Sourdough & avocado", price: "8.90", allergens: ["G"] },
      { name: "Toastie, ham & cheese", price: "6.50", allergens: ["G", "D"] },
      { name: "Mozzarella & tomato", price: "7.20", allergens: ["G", "D"] },
      { name: "Two eggs, sourdough", price: "7.80", allergens: ["G"] },
    ],
  },
  {
    id: "cold",
    label: "Cold",
    items: [
      { name: "Iced latte", price: "4.50", allergens: ["D"] },
      { name: "Cold brew", price: "4.20" },
      { name: "Iced matcha", price: "4.90", allergens: ["D"] },
      { name: "Affogato", price: "4.80", allergens: ["D"] },
      { name: "Sparkling water", price: "3.00" },
    ],
  },
];

export const allergenLegend = "G Gluten · N Nuts · D Dairy";

export const allergenDeclaration =
  "Full allergen declaration (14): celery, gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, nuts, peanuts, sesame, soybeans, sulphites — ask your server.";

export const reviews = [
  { quote: "Best flat white south of the Liffey.", author: "Aoife" },
  { quote: "The kind of café you plan your morning around.", author: "Marcus" },
  { quote: "Quiet, unhurried — exactly what Meath Street needed.", author: "Niamh" },
  { quote: "Sara pulls the best flat white I've had outside Lisbon.", author: "Tom" },
  { quote: "My laptop and I have unofficially moved in.", author: "Gráinne" },
  { quote: "Small, honest, and the pastries sell out for a reason.", author: "Diarmuid" },
];

export const mosaicSlots = [
  { id: "A", src: "/images/gallery/atmosphere-04.jpg", alt: "The counter and shelves at Café Lisboa, morning light through the window", ratio: 3 / 2 },
  { id: "B", src: "/images/gallery/detail-04.jpg", alt: "Stacked ceramic cups and saucers on the counter", ratio: 3584 / 4608 },
  { id: "C", src: "/images/gallery/product-01.jpg", alt: "Cappuccino with latte art, steam rising, spoon and napkin beside it", ratio: 1 },
  { id: "D", src: "/images/gallery/atmosphere-03.jpg", alt: "Reading corner with a leather armchair and marble table", ratio: 3 / 2 },
  { id: "E", src: "/images/gallery/facade-vertical.jpg", alt: "Café Lisboa's green shopfront at dusk", ratio: 3584 / 4608 },
] as const;

// Dados só da seção "Build Yours" — separados de menuCategories de propósito
// (o cardápio está fechado/aprovado, não mexer nele). "Americano" aqui é um
// item novo desta seção, distinto do "Iced americano" do cardápio (mesmo
// preço, €4.00, coincidência).
export const buildYoursOptions = {
  coffees: [
    { id: "flat-white", name: "Flat white", price: 4.2 },
    { id: "cappuccino", name: "Cappuccino", price: 4.0 },
    { id: "americano", name: "Americano", price: 4.0 },
    { id: "cortado", name: "Cortado", price: 3.8 },
    { id: "mocha", name: "Mocha", price: 4.6 },
    { id: "espresso", name: "Espresso", price: 3.2 },
  ],
  sizes: [
    { id: "regular", name: "Regular", delta: 0 },
    { id: "large", name: "Large", delta: 0.6 },
  ],
  extras: [
    { id: "none", name: "None", delta: 0 },
    { id: "extra-shot", name: "Extra shot", delta: 0.5 },
    { id: "oat", name: "Oat", delta: 0.4 },
  ],
} as const;
