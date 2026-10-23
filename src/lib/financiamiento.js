// Sistema francés: convierte la tasa efectiva anual a una tasa efectiva mensual.
export function calculateFinancing({ price, downPercent, annualRate, months }) {
  const values = [price, downPercent, annualRate, months];
  if (values.some((v) => v === '' || v === null || !Number.isFinite(Number(v)))) return null;
  const [p, d, a, n] = values.map(Number);
  if (p <= 0 || d < 0 || d > 100 || a < 0 || a > 100 || !Number.isInteger(n) || n < 1 || n > 120) return null;
  const downPayment = p * d / 100;
  const principal = p - downPayment;
  const monthlyRate = Math.expm1(Math.log1p(a / 100) / 12);
  const monthlyPayment = monthlyRate === 0 ? principal / n : principal * monthlyRate / -Math.expm1(-n * Math.log1p(monthlyRate));
  const loanTotal = monthlyPayment * n;
  return { downPayment, principal, monthlyRate, monthlyPayment, loanTotal, interest: Math.max(0, loanTotal - principal), purchaseTotal: downPayment + loanTotal };
}
