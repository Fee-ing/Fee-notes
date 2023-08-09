export function stripNumber (num, precision = 12) {
  return +parseFloat(num.toPrecision(precision))
}