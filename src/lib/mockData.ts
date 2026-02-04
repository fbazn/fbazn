export type MockItem = {
  id: string;
  title: string;
  asin: string;
  supplier: string;
  cost: number;
  buyBox: number;
  fees: number;
  profit: number;
  roi: number;
  rank: string;
  status: "Review" | "Saved" | "Rejected" | "In Progress";
  imageUrl?: string;
};

export type ReviewQueueItem = {
  id: string;
  type: "review";
  asin: string;
  title: string;
  marketplace: string;
  buyBoxPrice: number;
  estProfit: number;
  roiPct: number;
  savedAt: string;
  status: "pending_review";
  supplierName: string;
  supplierUrl: string;
  supplierCost: number;
  tags: string;
  notes: string;
  imageUrl?: string;
};

export const mockRecentItems: MockItem[] = [
  {
    id: "itm-001",
    title: "Apex Stainless Blender Bottle",
    asin: "B0C0FFBA2",
    supplier: "Target Wholesale",
    cost: 7.25,
    buyBox: 24.99,
    fees: 6.1,
    profit: 11.64,
    roi: 161,
    rank: "#4,210 Home & Kitchen",
    status: "Saved",
    imageUrl:
      "https://images.unsplash.com/photo-1526401281623-287d16b1c18a?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "itm-002",
    title: "Aurora LED Desk Lamp",
    asin: "B0A11LMP9",
    supplier: "BestBuy Liquidation",
    cost: 11.4,
    buyBox: 38.5,
    fees: 8.25,
    profit: 18.85,
    roi: 165,
    rank: "#2,980 Office Products",
    status: "Review",
  },
  {
    id: "itm-003",
    title: "Northwind Travel Organizer",
    asin: "B09TRORG3",
    supplier: "Nordic Imports",
    cost: 5.1,
    buyBox: 21.0,
    fees: 5.5,
    profit: 10.4,
    roi: 204,
    rank: "#8,113 Luggage",
    status: "Saved",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "itm-004",
    title: "Summit Pro Resistance Bands",
    asin: "B0RESBNDS",
    supplier: "Athlete Hub",
    cost: 9.0,
    buyBox: 29.95,
    fees: 7.35,
    profit: 13.6,
    roi: 151,
    rank: "#1,487 Sports",
    status: "In Progress",
  },
  {
    id: "itm-005",
    title: "Lumen Smart Plug Duo",
    asin: "B0PLUG88",
    supplier: "Electra Pro",
    cost: 8.75,
    buyBox: 26.5,
    fees: 6.45,
    profit: 11.3,
    roi: 129,
    rank: "#3,994 Smart Home",
    status: "Saved",
    imageUrl:
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "itm-006",
    title: "Everly Insulated Lunch Tote",
    asin: "B0LUNCH19",
    supplier: "Coastal Goods",
    cost: 6.35,
    buyBox: 22.99,
    fees: 5.9,
    profit: 10.74,
    roi: 169,
    rank: "#5,320 Kitchen",
    status: "Review",
  },
  {
    id: "itm-007",
    title: "Cove Ceramic Travel Mug",
    asin: "B0MUG55",
    supplier: "Urban Traders",
    cost: 4.95,
    buyBox: 19.99,
    fees: 5.1,
    profit: 9.94,
    roi: 201,
    rank: "#6,804 Kitchen",
    status: "Saved",
  },
  {
    id: "itm-008",
    title: "Nimbus Bluetooth Speaker",
    asin: "B0SPKR77",
    supplier: "Audio Liquidators",
    cost: 12.5,
    buyBox: 42.0,
    fees: 9.4,
    profit: 20.1,
    roi: 161,
    rank: "#1,930 Electronics",
    status: "Rejected",
    imageUrl:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=200&q=80",
  },
];

export const mockSourcingRows: MockItem[] = [
  {
    id: "src-001",
    title: "Voltix USB-C Docking Station",
    asin: "B0DOCK44",
    supplier: "Costco",
    cost: 18.3,
    buyBox: 54.99,
    fees: 11.7,
    profit: 24.99,
    roi: 136,
    rank: "#1,210 Computers",
    status: "Review",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "src-002",
    title: "Terra Eco Water Bottle",
    asin: "B0WTR88",
    supplier: "REI Surplus",
    cost: 6.9,
    buyBox: 24.0,
    fees: 5.6,
    profit: 11.5,
    roi: 167,
    rank: "#7,402 Outdoors",
    status: "Saved",
  },
  {
    id: "src-003",
    title: "Pulse Fitness Tracker",
    asin: "B0FIT77",
    supplier: "Gadget Hub",
    cost: 22.4,
    buyBox: 65.0,
    fees: 13.9,
    profit: 28.7,
    roi: 128,
    rank: "#2,845 Wearables",
    status: "In Progress",
    imageUrl:
      "https://images.unsplash.com/photo-1518441902117-fb0e8ef61f2b?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "src-004",
    title: "Halo Desk Cable Kit",
    asin: "B0CABL10",
    supplier: "OfficeMax",
    cost: 3.2,
    buyBox: 17.5,
    fees: 4.5,
    profit: 9.8,
    roi: 206,
    rank: "#3,412 Office",
    status: "Review",
  },
  {
    id: "src-005",
    title: "Solace Memory Foam Pillow",
    asin: "B0PIL88",
    supplier: "HomeGoods",
    cost: 9.75,
    buyBox: 33.0,
    fees: 7.85,
    profit: 15.4,
    roi: 158,
    rank: "#2,118 Bedroom",
    status: "Saved",
    imageUrl:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "src-006",
    title: "Nova Silicone Bakeware Set",
    asin: "B0BAKE12",
    supplier: "Chef Supply",
    cost: 8.4,
    buyBox: 27.99,
    fees: 6.25,
    profit: 13.34,
    roi: 159,
    rank: "#4,011 Kitchen",
    status: "Rejected",
  },
  {
    id: "src-007",
    title: "Edge Pro Gaming Mouse",
    asin: "B0MOUSE2",
    supplier: "MicroCenter",
    cost: 14.8,
    buyBox: 49.5,
    fees: 10.2,
    profit: 24.5,
    roi: 166,
    rank: "#1,548 PC Accessories",
    status: "Review",
    imageUrl:
      "https://images.unsplash.com/photo-1587202372775-a1a76ebdc3d6?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "src-008",
    title: "Bloom Aromatherapy Diffuser",
    asin: "B0DIFF33",
    supplier: "Wellness Depot",
    cost: 7.9,
    buyBox: 29.0,
    fees: 6.8,
    profit: 14.3,
    roi: 181,
    rank: "#3,295 Wellness",
    status: "Saved",
  },
];

export const mockReviewQueueItems: ReviewQueueItem[] = [
  {
    id: "rq-001",
    type: "review",
    asin: "B0C9JQ4L5Z",
    title: "Ergonomic Mesh Office Chair",
    marketplace: "UK",
    buyBoxPrice: 129.99,
    estProfit: 28.4,
    roiPct: 21,
    savedAt: "2024-05-21 09:24",
    status: "pending_review",
    supplierName: "Mason Office Supply",
    supplierUrl: "https://supplier.example.com/mesh-chair",
    supplierCost: 76.5,
    tags: "office, seating, premium",
    notes: "Check packaging requirements for UK inbound shipment.",
    imageUrl:
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "rq-002",
    type: "review",
    asin: "B08Q6K2M9D",
    title: "Stainless Steel Air Fryer 5L",
    marketplace: "US",
    buyBoxPrice: 89.5,
    estProfit: 18.75,
    roiPct: 26,
    savedAt: "2024-05-21 10:15",
    status: "pending_review",
    supplierName: "Kitchen Direct",
    supplierUrl: "https://supplier.example.com/air-fryer-5l",
    supplierCost: 52.25,
    tags: "kitchen, appliances",
    notes: "Confirm warranty terms before ordering.",
    imageUrl:
      "https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "rq-003",
    type: "review",
    asin: "B0B7Y9W4H2",
    title: "Rechargeable LED Desk Lamp",
    marketplace: "DE",
    buyBoxPrice: 44.0,
    estProfit: 11.2,
    roiPct: 31,
    savedAt: "2024-05-20 16:48",
    status: "pending_review",
    supplierName: "Lumen Trade",
    supplierUrl: "https://supplier.example.com/led-desk-lamp",
    supplierCost: 22.8,
    tags: "lighting, office",
    notes: "Request updated compliance docs for EU listing.",
  },
  {
    id: "rq-004",
    type: "review",
    asin: "B09ZV3N7R1",
    title: "Smart Wi-Fi Plug (4-Pack)",
    marketplace: "UK",
    buyBoxPrice: 24.99,
    estProfit: 6.1,
    roiPct: 19,
    savedAt: "2024-05-20 12:02",
    status: "pending_review",
    supplierName: "Smart Home Wholesale",
    supplierUrl: "https://supplier.example.com/wifi-plug-4pack",
    supplierCost: 13.4,
    tags: "smart home, bundle",
    notes: "Bundle pricing looks tight; validate shipping costs.",
  },
  {
    id: "rq-005",
    type: "review",
    asin: "B0C2J5L8P8",
    title: "Portable 12L Mini Fridge",
    marketplace: "US",
    buyBoxPrice: 74.0,
    estProfit: 15.45,
    roiPct: 23,
    savedAt: "2024-05-19 18:37",
    status: "pending_review",
    supplierName: "Chill Logistics",
    supplierUrl: "https://supplier.example.com/12l-mini-fridge",
    supplierCost: 41.9,
    tags: "appliances, travel",
    notes: "Potential to add travel bundle for summer promo.",
    imageUrl:
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=200&q=80",
  },
];
