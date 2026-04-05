export interface PricingBreakdown {
  sanctuaryRate: number
  aggregatorRate: number
  aggregatorCommission: number
  hotelReceivesAggregator: number
  hotelReceivesSanctuary: number
  guestSaving: number
  guestSavingPct: number
}

export function calcSanctuaryPricing(
  hotelRackRate: number,
  hotelMonthlyFeePence: number = 0,
  avgMonthlyBookings: number = 40
): PricingBreakdown {
  const aggregatorRate       = hotelRackRate
  const aggregatorCommission = aggregatorRate * 0.20
  const hotelReceivesAggregator = aggregatorRate - aggregatorCommission

  const feePerBooking = hotelMonthlyFeePence / 100 / avgMonthlyBookings
  const saving        = aggregatorCommission - feePerBooking
  const guestSaving   = saving * 0.10
  const sanctuaryRate = aggregatorRate - guestSaving

  return {
    sanctuaryRate:           Math.round(sanctuaryRate * 100) / 100,
    aggregatorRate:          Math.round(aggregatorRate * 100) / 100,
    aggregatorCommission:    Math.round(aggregatorCommission * 100) / 100,
    hotelReceivesAggregator: Math.round(hotelReceivesAggregator * 100) / 100,
    hotelReceivesSanctuary:  Math.round((aggregatorRate - guestSaving) * 100) / 100,
    guestSaving:             Math.round(guestSaving * 100) / 100,
    guestSavingPct:          Math.round((guestSaving / aggregatorRate) * 1000) / 10,
  }
}

export const DURATION_HOURS: Record<string, number> = {
  three_hour:  3,
  four_hour:   4,
  six_hour:    6,
  eight_hour:  8,
  full_day:    10,
}

export const DURATION_LABELS: Record<string, string> = {
  three_hour:  '3 hours',
  four_hour:   '4 hours',
  six_hour:    '6 hours',
  eight_hour:  '8 hours',
  full_day:    'Full day',
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount)
}
