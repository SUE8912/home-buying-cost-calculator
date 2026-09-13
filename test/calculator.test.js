import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, brokerageInfo, loanStampInfo, acquisitionRate, formatKoreanAmount, legalBasicFee } from '../src/calculator.js';

const base = { firstHome:true, over85:false, loan:400_000_000, paid:0, bond:null };
const cases = [
  [500_000_000,[5_000_000,2_000_000,3_000_000,500_000,3_500_000,2_000_000,6_175_000,506_175_000,106_175_000]],
  [700_000_000,[11_666_900,2_000_000,9_666_900,1_166_690,10_833_590,2_800_000,14_448_590,714_448_590,314_448_590]],
  [708_000_000,[12_177_600,2_000_000,10_177_600,1_217_760,11_395_360,2_832_000,15_047_960,723_047_960,323_047_960]],
];
for (const [price, expected] of cases) test(`specified calculation ${price}`,()=>{const r=calculate({...base,price});assert.deepEqual([r.acquisitionBefore,r.reduction,r.acquisition,r.education,r.acquisitionTotal,r.brokerage,r.incidental,r.total,r.cash],expected)});
test('specified totals at 900m, 1.2b and 1.4b',()=>{assert.equal(calculate({...base,price:900_000_000}).incidental,33_155_000);assert.equal(calculate({...base,price:1_200_000_000}).incidental,45_925_000);assert.equal(calculate({...base,price:1_400_000_000}).incidental,55_825_000)});
test('brokerage and first-home boundaries',()=>{assert.equal(brokerageInfo(899_999_999).rate,.004);assert.equal(brokerageInfo(900_000_000).rate,.005);assert.equal(brokerageInfo(1_199_999_999).rate,.005);assert.equal(brokerageInfo(1_200_000_000).rate,.006);assert.equal(brokerageInfo(1_499_999_999).rate,.006);assert.equal(brokerageInfo(1_500_000_000).rate,.007);assert.equal(calculate({...base,price:1_200_000_000}).reduction,2_000_000);assert.equal(calculate({...base,price:1_200_000_001}).reduction,0)});
test('acquisition and loan stamp boundaries',()=>{assert.equal(acquisitionRate(600_000_000),.01);assert.ok(acquisitionRate(600_000_001)>.01);for(const [loan,customer] of [[50_000_000,0],[50_000_001,35_000],[100_000_000,35_000],[100_000_001,75_000],[1_000_000_000,75_000],[1_000_000_001,175_000]])assert.equal(loanStampInfo(loan).customer,customer)});
test('paid amount only changes cash requirement',()=>{const r=calculate({...base,price:700_000_000,paid:210_000_000});assert.equal(r.incidental,14_448_590);assert.equal(r.cash,104_448_590)});

test('Korean purchase-price helpers use the current amount', () => {
  for (const [price, label] of [[500_000_000,'약 5억원'],[700_000_000,'약 7억원'],[708_000_000,'약 7억 800만원'],[1_000_000_000,'약 10억원'],[1_200_000_000,'약 12억원'],[1_243_500_000,'약 12억 4,350만원']]) assert.equal(formatKoreanAmount(price), label);
});

test('legal basic fee uses every bracket and specified values', () => {
  for (const [price, fee] of [[50_000_000,210_000],[100_000_000,260_000],[300_000_000,440_000],[500_000_000,600_000],[700_000_000,740_000],[1_000_000_000,950_000],[1_200_000_000,1_050_000],[1_500_000_000,1_200_000],[2_000_000_000,1_450_000],[20_000_000_000,8_650_000],[21_000_000_000,8_750_000]]) assert.equal(legalBasicFee(price), fee);
});

test('legal basic fee selects the new bracket immediately above each boundary', () => {
  for (const [price, fee] of [[50_010_000,210_010],[100_010_000,260_009],[300_010_000,440_008],[500_010_000,600_007],[1_000_010_000,950_005],[2_000_010_000,1_450_004],[20_000_010_000,8_650_001]]) assert.equal(legalBasicFee(price), fee);
});
