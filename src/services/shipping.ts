// Shipping & Logistics Service for Orvella Organics
// Automated multi-carrier support: Blue Dart (Express Air) & Delhivery / NimbusPost (Standard Surface)

export interface ShippingCourierOption {
  id: string;
  name: string;
  carrier: 'Delhivery' | 'Blue Dart' | 'DTDC';
  type: 'standard' | 'express';
  deliveryDays: string;
  chargePaise: number;
  isFreeEligible: boolean;
  description: string;
}

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  isDeliverable: boolean;
  zone: 'local' | 'metro' | 'regional' | 'national';
}

const METRO_PIN_PREFIXES = ['11', '40', '56', '60', '70', '50', '41', '38']; // Delhi, Mumbai, BLR, Chennai, Kolkata, HYD, Pune, Ahmedabad
const GUJARAT_PIN_PREFIXES = ['36', '37', '38', '39']; // Local Gujarat zone

/**
 * Validate 6-digit Indian PIN code format
 */
export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

/**
 * Resolve zone and estimated delivery timeframe from Indian PIN code
 */
export function resolvePincodeInfo(pincode: string): PincodeInfo {
  const cleanPin = pincode.trim();
  if (!isValidIndianPincode(cleanPin)) {
    return {
      pincode: cleanPin,
      city: '',
      state: '',
      isDeliverable: false,
      zone: 'national',
    };
  }

  const prefix = cleanPin.substring(0, 2);
  let zone: PincodeInfo['zone'] = 'national';
  let state = 'India';

  if (GUJARAT_PIN_PREFIXES.includes(prefix)) {
    zone = 'local';
    state = 'Gujarat';
  } else if (METRO_PIN_PREFIXES.includes(prefix)) {
    zone = 'metro';
  }

  return {
    pincode: cleanPin,
    city: '',
    state,
    isDeliverable: true,
    zone,
  };
}

/**
 * Calculate available shipping courier quotes based on cart subtotal and pincode
 */
export function getShippingQuotes(
  subtotalPaise: number,
  pincode?: string,
  totalWeightGrams: number = 300
): ShippingCourierOption[] {
  const isFreeDelivery = subtotalPaise >= 49900; // Free delivery above ₹499
  const pinInfo = pincode ? resolvePincodeInfo(pincode) : null;

  let standardDays = '3 - 5 Business Days';
  let expressDays = '1 - 2 Business Days';

  if (pinInfo) {
    if (pinInfo.zone === 'local') {
      standardDays = '1 - 2 Business Days';
      expressDays = 'Next Day Guaranteed';
    } else if (pinInfo.zone === 'metro') {
      standardDays = '2 - 3 Business Days';
      expressDays = '1 - 2 Business Days';
    }
  }

  return [
    {
      id: 'delhivery-standard',
      name: 'Delhivery Standard Surface',
      carrier: 'Delhivery',
      type: 'standard',
      deliveryDays: standardDays,
      chargePaise: isFreeDelivery ? 0 : 4900, // ₹49 if under ₹499
      isFreeEligible: true,
      description: isFreeDelivery
        ? 'FREE (Applied for orders ₹499+)'
        : '₹49 flat rate for orders below ₹499',
    },
    {
      id: 'bluedart-express',
      name: 'Blue Dart Express Air',
      carrier: 'Blue Dart',
      type: 'express',
      deliveryDays: expressDays,
      chargePaise: 9900, // ₹99 priority express
      isFreeEligible: false,
      description: 'Fastest air transit with priority dispatch & real-time GPS tracking',
    },
  ];
}
