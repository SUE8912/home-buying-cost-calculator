import test from 'node:test';
import assert from 'node:assert/strict';
import { bindCalculationInteractions } from '../src/interaction.js';

class Element extends EventTarget {
  constructor({ value = '', dataset = {} } = {}) {
    super();
    this.value = value;
    this.dataset = dataset;
    this.buttons = [];
  }
  querySelectorAll() { return this.buttons; }
}

const click = (target) => {
  const event = new Event('click');
  Object.defineProperty(event, 'target', { value: target });
  return event;
};

function setup() {
  const price = new Element({ value: '700,000,000' });
  const form = new Element();
  const chips = new Element({ dataset: { target: 'purchase-price' } });
  const chip = new Element({ dataset: { value: '1000000000' } });
  chip.classList = { toggle: () => {} };
  chips.buttons = [chip];
  const calls = { sync: 0, render: 0, reveal: 0, scroll: 0 };
  bindCalculationInteractions({
    moneyInputs: [price],
    chipGroups: [chips],
    form,
    resolveInput: () => price,
    syncInput: () => { calls.sync += 1; },
    render: () => { calls.render += 1; },
    revealResults: () => { calls.reveal += 1; },
    scrollToResults: () => { calls.scroll += 1; }
  });
  return { price, form, chips, chip, calls };
}

test('typing synchronizes the amount helper without recalculating results', () => {
  const { price, calls } = setup();
  price.dispatchEvent(new Event('input'));
  assert.deepEqual(calls, { sync: 1, render: 0, reveal: 0, scroll: 0 });
});

test('amount chips synchronize the input without recalculating results', () => {
  const { price, chips, chip, calls } = setup();
  chips.dispatchEvent(click(chip));
  assert.equal(price.value, '1,000,000,000');
  assert.deepEqual(calls, { sync: 1, render: 0, reveal: 0, scroll: 0 });
});

test('submitting is the only interaction that recalculates and scrolls to results', () => {
  const { form, calls } = setup();
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  assert.deepEqual(calls, { sync: 0, render: 1, reveal: 1, scroll: 1 });
});
