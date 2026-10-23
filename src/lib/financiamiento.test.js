import { expect, it } from 'vitest';
import { calculateFinancing } from './financiamiento';
const sample = { price: 20000, downPercent: 20, annualRate: 12, months: 36 };
it('convierte TEA a tasa mensual efectiva y mantiene los totales coherentes', () => {
  const result = calculateFinancing(sample);
  expect(result.principal).toBe(16000);
  expect((1 + result.monthlyRate) ** 12).toBeCloseTo(1.12, 10);
  expect(result.purchaseTotal).toBeCloseTo(sample.price + result.interest, 8);
  let balance = result.principal;
  for (let i = 0; i < sample.months; i++) balance = balance * (1 + result.monthlyRate) - result.monthlyPayment;
  expect(balance).toBeCloseTo(0, 7);
});
it('admite tasa cero y una inicial del 100% sin NaN', () => {
  expect(calculateFinancing({ ...sample, annualRate: 0 }).monthlyPayment).toBeCloseTo(16000 / 36);
  const paid = calculateFinancing({ ...sample, downPercent: 100 });
  expect(paid.monthlyPayment).toBe(0);
  expect(paid.purchaseTotal).toBe(sample.price);
});
it('rechaza entradas vacías, tasas y plazos fuera de rango', () => {
  for (const change of [{ annualRate: '' }, { annualRate: -1 }, { annualRate: 101 }, { downPercent: 101 }, { downPercent: -1 }, { months: 0 }, { months: 1.5 }, { months: 121 }, { price: Infinity }, { price: 0 }]) expect(calculateFinancing({ ...sample, ...change })).toBeNull();
});
