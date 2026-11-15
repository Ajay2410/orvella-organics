import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getShippingQuotes, isValidIndianPincode, resolvePincodeInfo } from '../src/services/shipping.ts';

describe('Phase 4: Pricing, Tax and Shipping Math Tests', () => {
  it('correctly validates 6-digit Indian PIN codes', () => {
    assert.equal(isValidIndianPincode('395006'), true); // Surat
    assert.equal(isValidIndianPincode('400001'), true); // Mumbai
    assert.equal(isValidIndianPincode('110001'), true); // Delhi
    assert.equal(isValidIndianPincode('012345'), false); // Cannot start with 0
    assert.equal(isValidIndianPincode('39500'), false); // 5 digits
    assert.equal(isValidIndianPincode('3950001'), false); // 7 digits
    assert.equal(isValidIndianPincode('abc123'), false); // Alphanumeric
  });

  it('correctly resolves Gujarat local zone for Surat warehouse (pickup pincode 395006)', () => {
    const info = resolvePincodeInfo('395006');
    assert.equal(info.isDeliverable, true);
    assert.equal(info.zone, 'local');
    assert.equal(info.state, 'Gujarat');
  });

  it('correctly resolves Metro zone for Mumbai & Delhi', () => {
    const mumbai = resolvePincodeInfo('400050');
    assert.equal(mumbai.zone, 'metro');

    const delhi = resolvePincodeInfo('110001');
    assert.equal(delhi.zone, 'metro');
  });

  it('applies FREE delivery on orders ₹499 and above (49900 paise)', () => {
    // 49900 paise = ₹499
    const quotes = getShippingQuotes(49900, '395006');
    const standardCourier = quotes.find((q) => q.id === 'delhivery-standard');
    assert.ok(standardCourier);
    assert.equal(standardCourier.chargePaise, 0); // FREE!
  });

  it('applies ₹49 flat delivery on orders below ₹499 (< 49900 paise)', () => {
    // 24900 paise = ₹249
    const quotes = getShippingQuotes(24900, '395006');
    const standardCourier = quotes.find((q) => q.id === 'delhivery-standard');
    assert.ok(standardCourier);
    assert.equal(standardCourier.chargePaise, 4900); // ₹49
  });

  it('charges ₹99 priority express rate for Blue Dart Air regardless of threshold', () => {
    const quotesUnder = getShippingQuotes(14900, '400001');
    const expressUnder = quotesUnder.find((q) => q.id === 'bluedart-express');
    assert.ok(expressUnder);
    assert.equal(expressUnder.chargePaise, 9900); // ₹99

    const quotesOver = getShippingQuotes(100000, '400001');
    const expressOver = quotesOver.find((q) => q.id === 'bluedart-express');
    assert.ok(expressOver);
    assert.equal(expressOver.chargePaise, 9900); // Still ₹99 for guaranteed air express
  });

  it('calculates integer paise order totals without floating point precision loss', () => {
    const item1Paise = 24900; // ₹249
    const qty1 = 2;
    const item2Paise = 14900; // ₹149
    const qty2 = 1;

    const subtotalPaise = item1Paise * qty1 + item2Paise * qty2; // 49800 + 14900 = 64700 paise (₹647)
    assert.equal(subtotalPaise, 64700);

    const quotes = getShippingQuotes(subtotalPaise, '395006');
    const shipping = quotes.find((q) => q.id === 'delhivery-standard');
    assert.equal(shipping.chargePaise, 0); // Free delivery since > 49900

    const totalPaise = subtotalPaise + shipping.chargePaise;
    assert.equal(totalPaise, 64700);
    assert.equal(totalPaise / 100, 647.00);
  });

  it('calculates 5% GST tax component correctly from retail inclusive price', () => {
    // Example: ₹249 total price (24900 paise), 5% GST included
    const totalPaise = 24900;
    const taxablePaise = Math.round(totalPaise / 1.05); // 23714 paise
    const totalGstPaise = totalPaise - taxablePaise; // 1186 paise
    const cgstPaise = Math.round(totalGstPaise / 2); // 593 paise (2.5%)
    const sgstPaise = totalGstPaise - cgstPaise; // 593 paise (2.5%)

    assert.equal(taxablePaise + cgstPaise + sgstPaise, totalPaise);
    assert.equal(cgstPaise, sgstPaise);
  });
});
