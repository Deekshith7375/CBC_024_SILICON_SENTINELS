export const INITIAL_SHOPS = [
  {
    id: "shop_clothes_bags",
    name: "Everyday Clothes & Bags",
    category: "Clothing, Apparel & Bags",
    owner: "Elena Rostova",
    email: "clothes.bags@returnsphere.com",
    policy: {
      return_window_days: 30,
      allowed_reasons: [
        "Defective/Damaged",
        "Wrong Size",
        "Wrong Product",
        "Other"
      ],
      requires_approval: false,
      vision_ssim_threshold: 78,
      allow_exchanges: true
    }
  },
  {
    id: "shop_mobile_tech",
    name: "Apex Mobile & Accessories",
    category: "Smartphones, Mobile & Accessories",
    owner: "Marcus Vance",
    email: "mobile.tech@returnsphere.com",
    policy: {
      return_window_days: 14,
      allowed_reasons: [
        "Defective or not turning on",
        "Wrong item received",
        "Screen or cosmetic defect",
        "Exchanging for different model"
      ],
      requires_approval: false,
      vision_ssim_threshold: 75,
      allow_exchanges: true
    }
  }
];

export const INITIAL_PRODUCTS = [
  // --- Shop 1: Everyday Clothes & Bags ---
  {
    id: "inv-cb-1",
    shop_id: "shop_clothes_bags",
    name: "The Everyday Linen Shirt",
    sku: "ELS-OAT-L",
    price: 78.00,
    stock: 25,
    reserved: 2,
    category: "shoes_clothes",
    ref_image: "/assets/linen-front.jpg",
    specs: "Oatmeal · Size L · 100% Breathable Linen"
  },
  {
    id: "inv-cb-2",
    shop_id: "shop_clothes_bags",
    name: "The Relaxed Cotton Tee",
    sku: "RCT-CHK-M",
    price: 38.00,
    stock: 32,
    reserved: 1,
    category: "shoes_clothes",
    ref_image: "/assets/history-cotton-tee.jpg",
    specs: "Chalk White · Size M · Heavyweight Organic Cotton"
  },
  {
    id: "inv-cb-3",
    shop_id: "shop_clothes_bags",
    name: "The Essential Chino Pant",
    sku: "ECH-SND-32",
    price: 88.00,
    stock: 18,
    reserved: 0,
    category: "shoes_clothes",
    ref_image: "/assets/history-chino.jpg",
    specs: "Sand Tan · Size 32W · Stretch Twill"
  },
  {
    id: "inv-cb-4",
    shop_id: "shop_clothes_bags",
    name: "Everyday Commute Backpack · 22L",
    sku: "EDB-22-NV",
    price: 89.00,
    stock: 19,
    reserved: 1,
    category: "shoes_clothes",
    ref_image: "/assets/inv-everyday-backpack.jpg",
    specs: "Midnight Navy · 22L · Water-resistant Ballistic Nylon"
  },
  {
    id: "inv-cb-5",
    shop_id: "shop_clothes_bags",
    name: "Commuter Canvas Tote · 18L",
    sku: "CMT-18-SG",
    price: 74.00,
    stock: 12,
    reserved: 0,
    category: "shoes_clothes",
    ref_image: "/assets/inv-commuter-tote.jpg",
    specs: "Slate Grey · 18L · Reinforced Handles"
  },
  {
    id: "inv-cb-6",
    shop_id: "shop_clothes_bags",
    name: "Weekend Travel Duffel · 30L",
    sku: "TRV-30-FG",
    price: 109.00,
    stock: 9,
    reserved: 1,
    category: "shoes_clothes",
    ref_image: "/assets/inv-travel-duffel.jpg",
    specs: "Forest Green · 30L · YKK Heavy-Duty Zippers"
  },
  {
    id: "inv-cb-7",
    shop_id: "shop_clothes_bags",
    name: "Compact Crossbody Bag · 8L",
    sku: "CSB-08-SB",
    price: 54.00,
    stock: 16,
    reserved: 0,
    category: "shoes_clothes",
    ref_image: "/assets/inv-crossbody-bag.jpg",
    specs: "Sand Beige · 8L · Quick-release Magnetic Clasp"
  },

  // --- Shop 2: Apex Mobile & Accessories ---
  {
    id: "inv-mt-1",
    shop_id: "shop_mobile_tech",
    name: "Apex Flagship Pro Smartphone · 256GB",
    sku: "APX-PH-256",
    price: 899.00,
    stock: 14,
    reserved: 1,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-smartphone.jpg",
    specs: "Titanium Grey · 256GB · 6.7\" OLED 120Hz Display"
  },
  {
    id: "inv-mt-2",
    shop_id: "shop_mobile_tech",
    name: "MagCharge Wireless Fast Charger · 15W Stand",
    sku: "MGC-WCH-15",
    price: 39.99,
    stock: 45,
    reserved: 2,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-wireless-charger.jpg",
    specs: "Matte Black · 15W Qi2 Fast Wireless Induction"
  },
  {
    id: "inv-mt-3",
    shop_id: "shop_mobile_tech",
    name: "Ultra-Tough Shockproof Phone Case",
    sku: "UT-CASE-BLK",
    price: 29.99,
    stock: 60,
    reserved: 0,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-phone-case.jpg",
    specs: "Carbon Black · Military Drop-Tested 10ft · Slim Grip"
  },
  {
    id: "inv-mt-4",
    shop_id: "shop_mobile_tech",
    name: "9H Tempered Glass Screen Protector · 2-Pack",
    sku: "TG-SCR-2PK",
    price: 19.99,
    stock: 75,
    reserved: 0,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-screen-protector.jpg",
    specs: "Edge-to-Edge Clarity · Oleophobic Anti-Fingerprint"
  },
  {
    id: "inv-mt-5",
    shop_id: "shop_mobile_tech",
    name: "AuraPulse Wireless Noise-Cancelling Earbuds",
    sku: "AP-EAR-WHT",
    price: 149.00,
    stock: 28,
    reserved: 1,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-earbuds.jpg",
    specs: "Pearl White · Bluetooth 5.4 · 32hr Battery with Case"
  },
  {
    id: "inv-mt-6",
    shop_id: "shop_mobile_tech",
    name: "Braided USB-C Fast Charging Cable · 2m",
    sku: "CBL-USBC-2M",
    price: 18.50,
    stock: 80,
    reserved: 0,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-usb-cable.jpg",
    specs: "Nylon Braided · 100W Power Delivery · 2m"
  },
  {
    id: "inv-mt-7",
    shop_id: "shop_mobile_tech",
    name: "20000mAh Dual USB-C Portable Power Bank",
    sku: "PB-20K-SLV",
    price: 59.99,
    stock: 32,
    reserved: 0,
    category: "electronics_smartphones",
    ref_image: "/assets/mobile-powerbank.jpg",
    specs: "Silver Aluminum · 65W Laptop & Phone Fast Charge"
  }
];

export const DEMO_ORDERS = [
  {
    order_id: "NL20791B",
    customer_name: "Alex Morgan",
    customer_email: "alex.morgan@example.com",
    shop_id: "shop_clothes_bags",
    product_id: "inv-cb-4",
    purchase_date: "2026-10-08",
    product_name: "Everyday Commute Backpack · 22L",
    price: 89.00,
    image: "/assets/inv-everyday-backpack.jpg",
    store_name: "Everyday Clothes & Bags",
    intended_action: "return"
  },
  {
    order_id: "AP8921PH",
    customer_name: "Jamie Lee",
    customer_email: "jamie.lee@example.com",
    shop_id: "shop_mobile_tech",
    product_id: "inv-mt-1",
    purchase_date: "2026-10-09",
    product_name: "Apex Flagship Pro Smartphone · 256GB",
    price: 899.00,
    image: "/assets/mobile-smartphone.jpg",
    store_name: "Apex Mobile & Accessories",
    intended_action: "exchange"
  }
];

export const DEMO_INSPECTIONS = [
  {
    id: "case-scratched-screen",
    title: "Heavy Wear & Screen Defect",
    item_name: "Apex Flagship Pro Smartphone",
    ref_image: "/assets/mobile-smartphone.jpg",
    return_image: "/assets/headphones-scratched.jpg",
    claim_reason: "Screen or cosmetic defect",
    customer_note: "Phone glass scratched during unboxing.",
    ssim_score: 44.8,
    defect_detected: true,
    defect_type: "Physical Surface Scratches & Glass Abrasions",
    keypoints_matched: 218,
    vision_verdict: "FAILED",
    verdict_badge: "REJECTED (Customer Damage)",
    verdict_color: "rose",
    policy_status: "Rejected by AI Condition Guard",
    inventory_impact: "No inventory reserved. Item marked damaged.",
    explanation: "Computer Vision detected 55.2% structural divergence from reference photo. Severe abrasions detected."
  },
  {
    id: "case-pristine-linen",
    title: "Pristine Condition Linen Shirt",
    item_name: "The Everyday Linen Shirt",
    ref_image: "/assets/linen-front.jpg",
    return_image: "/assets/linen-front.jpg",
    claim_reason: "Wrong Size",
    customer_note: "Unworn with tags attached. Requesting size exchange.",
    ssim_score: 96.5,
    defect_detected: false,
    defect_type: "None (Pristine Unworn Condition)",
    keypoints_matched: 890,
    vision_verdict: "PASSED",
    verdict_badge: "APPROVED (Exchange Reserved)",
    verdict_color: "emerald",
    policy_status: "Within 30-day window • Valid tags",
    inventory_impact: "Replacement unit reserved from warehouse.",
    explanation: "AI Vision analysis confirmed 96.5% match with brand-new product standard. Fabric and stitching verified pristine."
  }
];

// Clean slate: Customer will upload their own photos for both return and exchange
export const INITIAL_REQUESTS = [];
