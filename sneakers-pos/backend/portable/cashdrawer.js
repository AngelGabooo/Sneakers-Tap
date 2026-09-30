// cashdrawer.js
export const OPEN_DRAWER_PIN_2 = Buffer.from([0x1b, 0x70, 0x00, 0x32, 0x32])
export const OPEN_DRAWER_PIN_5 = Buffer.from([0x1b, 0x70, 0x01, 0x32, 0x32])

export function getOpenDrawerBuffer(pin = 0) {
  return pin === 1 ? OPEN_DRAWER_PIN_5 : OPEN_DRAWER_PIN_2
}