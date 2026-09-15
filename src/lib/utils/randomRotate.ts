export function randomRotate(seed: number): string {
  return `rotate(${(seed % 7) - 3}deg)`;
}

export function rotateDeg(degrees: number): string {
  return `rotate(${degrees}deg)`;
}
