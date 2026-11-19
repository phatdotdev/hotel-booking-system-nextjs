export const TAX_RATE = 0.1;

export function parseStay(checkInDate: string, checkOutDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkInDate) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) return null;
  const checkIn = new Date(`${checkInDate}T00:00:00.000Z`);
  const checkOut = new Date(`${checkOutDate}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkIn.toISOString().slice(0, 10) !== checkInDate || checkOut.toISOString().slice(0, 10) !== checkOutDate || checkIn < today || checkOut <= checkIn) return null;
  const totalNights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
  if (totalNights > 30) return null;
  const nights = Array.from({ length: totalNights }, (_, index) => new Date(checkIn.getTime() + index * 86400000).toISOString().slice(0, 10));
  return { checkIn, checkOut, totalNights, nights };
}

export function calculatePricing(pricePerNight: number, totalNights: number) {
  const subtotal = pricePerNight * totalNights;
  const taxAndFees = Math.round(subtotal * TAX_RATE);
  return { pricePerNight, totalNights, subtotal, taxAndFees, discountAmount: 0, totalAmount: subtotal + taxAndFees };
}
