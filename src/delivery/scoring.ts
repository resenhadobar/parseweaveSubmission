export type DeliveryScore = {
  baseValue: number
  speedBonus: number
  radBonus: number
  payout: number
}

export function calculateDeliveryScore(timer: number, speed: number, radBonus: number): DeliveryScore {
  const baseValue = 35
  const speedBonus = Math.max(0, Math.floor(timer * 2 + Math.abs(speed) * 1.5))
  const payout = baseValue + speedBonus + radBonus
  return { baseValue, speedBonus, radBonus, payout }
}
