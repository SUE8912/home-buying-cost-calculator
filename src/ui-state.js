export function formatKoreanMoney(value) {
  const amount = Math.round(Number(value) || 0);
  if (!amount) return '0원';
  const eok = Math.floor(amount / 100_000_000);
  const man = Math.round((amount % 100_000_000) / 10_000);
  return `약 ${eok ? `${eok}억` : ''}${man ? ` ${man.toLocaleString('ko-KR')}만원` : '원'}`.trim();
}

export function createCalculationState(calculate) {
  let result = null;
  let dirty = false;
  return {
    get result() { return result; },
    get hasResult() { return result !== null; },
    get dirty() { return dirty; },
    markChanged() { if (result !== null) dirty = true; },
    run(values) { result = calculate(values); dirty = false; return result; }
  };
}
