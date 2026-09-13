export const floor10 = value => Math.floor(value / 10) * 10;

export function acquisitionRate(price) {
  if (price <= 600_000_000) return 0.01;
  if (price <= 900_000_000) {
    const percent = (price * 2 / 300_000_000) - 3;
    return Math.ceil(percent * 10_000) / 10_000 / 100;
  }
  return 0.03;
}

export function brokerageInfo(price) {
  if (price < 50_000_000) return { rate: .006, cap: 250_000, label: '5천만원 미만' };
  if (price < 200_000_000) return { rate: .005, cap: 800_000, label: '5천만원 이상 ~ 2억원 미만' };
  if (price < 900_000_000) return { rate: .004, label: '2억원 이상 ~ 9억원 미만' };
  if (price < 1_200_000_000) return { rate: .005, label: '9억원 이상 ~ 12억원 미만' };
  if (price < 1_500_000_000) return { rate: .006, label: '12억원 이상 ~ 15억원 미만' };
  return { rate: .007, label: '15억원 이상' };
}

export function loanStampInfo(loan) {
  if (loan <= 50_000_000) return { total: 0, customer: 0, label: '5천만원 이하' };
  if (loan <= 100_000_000) return { total: 70_000, customer: 35_000, label: '5천만원 초과 ~ 1억원 이하' };
  if (loan <= 1_000_000_000) return { total: 150_000, customer: 75_000, label: '1억원 초과 ~ 10억원 이하' };
  return { total: 350_000, customer: 175_000, label: '10억원 초과' };
}

export function contractStamp(price) {
  if (price <= 100_000_000) return 0;
  return price <= 1_000_000_000 ? 150_000 : 350_000;
}

export function calculate({ price, firstHome, over85, loan, paid, legal = 800_000, bond = null }) {
  const rate = acquisitionRate(price);
  const acquisitionBefore = floor10(price * rate);
  const reduction = firstHome && price <= 1_200_000_000 ? Math.min(2_000_000, acquisitionBefore) : 0;
  const acquisition = Math.max(0, acquisitionBefore - reduction);
  const education = floor10(acquisitionBefore * .1);
  const rural = over85 ? floor10(price * .002) : 0;
  const acquisitionTotal = acquisition + education + rural;
  const broker = brokerageInfo(price);
  const brokerage = Math.min(floor10(price * broker.rate), broker.cap ?? Infinity);
  const loanStamp = loanStampInfo(loan);
  const incidental = acquisitionTotal + brokerage + legal + (bond ?? 0) + loanStamp.customer;
  const total = price + incidental;
  const cash = price - paid - loan + incidental;
  return { price, firstHome, over85, loan, paid, legal, bond, rate, acquisitionBefore, reduction, acquisition, education, rural, acquisitionTotal, broker, brokerage, loanStamp, contractStamp: contractStamp(price), incidental, total, cash };
}
