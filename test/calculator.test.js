import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, brokerageInfo, loanStampInfo, acquisitionRate } from '../src/calculator.js';

const base = { firstHome:true, over85:false, loan:400_000_000, paid:0, legal:800_000, bond:null };
const cases = [
  [500_000_000,[5_000_000,2_000_000,3_000_000,500_000,3_500_000,2_000_000,6_375_000,506_375_000,106_375_000]],
  [700_000_000,[11_666_900,2_000_000,9_666_900,1_166_690,10_833_590,2_800_000,14_508_590,714_508_590,314_508_590]],
  [708_000_000,[12_177_600,2_000_000,10_177_600,1_217_760,11_395_360,2_832_000,15_102_360,723_102_360,323_102_360]],
];
for (const [price, expected] of cases) test(`specified calculation ${price}`,()=>{const r=calculate({...base,price});assert.deepEqual([r.acquisitionBefore,r.reduction,r.acquisition,r.education,r.acquisitionTotal,r.brokerage,r.incidental,r.total,r.cash],expected)});
test('specified totals at 900m, 1.2b and 1.4b',()=>{assert.equal(calculate({...base,price:900_000_000}).incidental,33_075_000);assert.equal(calculate({...base,price:1_200_000_000}).incidental,45_675_000);assert.equal(calculate({...base,price:1_400_000_000}).incidental,55_475_000)});
test('brokerage and first-home boundaries',()=>{assert.equal(brokerageInfo(899_999_999).rate,.004);assert.equal(brokerageInfo(900_000_000).rate,.005);assert.equal(brokerageInfo(1_199_999_999).rate,.005);assert.equal(brokerageInfo(1_200_000_000).rate,.006);assert.equal(brokerageInfo(1_499_999_999).rate,.006);assert.equal(brokerageInfo(1_500_000_000).rate,.007);assert.equal(calculate({...base,price:1_200_000_000}).reduction,2_000_000);assert.equal(calculate({...base,price:1_200_000_001}).reduction,0)});
test('acquisition and loan stamp boundaries',()=>{assert.equal(acquisitionRate(600_000_000),.01);assert.ok(acquisitionRate(600_000_001)>.01);for(const [loan,customer] of [[50_000_000,0],[50_000_001,35_000],[100_000_000,35_000],[100_000_001,75_000],[1_000_000_000,75_000],[1_000_000_001,175_000]])assert.equal(loanStampInfo(loan).customer,customer)});
test('paid amount only changes cash requirement',()=>{const r=calculate({...base,price:700_000_000,paid:210_000_000});assert.equal(r.incidental,14_508_590);assert.equal(r.cash,104_508_590)});
