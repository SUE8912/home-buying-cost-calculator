import { calculate } from './calculator.js';

const $ = s => document.querySelector(s);
const won = n => `${Math.round(n).toLocaleString('ko-KR')}원`;
const shortWon = n => {
  n = Math.round(n); if (!n) return '0원';
  const eok = Math.floor(n / 100_000_000), man = Math.round((n % 100_000_000) / 10_000);
  return `${eok ? `${eok}억` : ''}${man ? ` ${man.toLocaleString()}만원` : ''}`.trim();
};
const parse = el => Number(el.value.replace(/[^0-9]/g, '')) || 0;
const inputs = ['purchase-price', 'loan', 'paid', 'legal', 'bond'];
let current;

function syncInput(el) {
  const raw = el.value.replace(/[^0-9]/g, ''); el.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
  const helper = $(`#${el.id}-korean`); if (helper) helper.textContent = shortWon(Number(raw));
}

function getValues() {
  return { price: parse($('#purchase-price')), firstHome: $('[name=firstHome]:checked').value === 'yes', over85: $('[name=area]:checked').value === 'over', loan: parse($('#loan')), paid: parse($('#paid')), legal: parse($('#legal')), bond: $('#bond').value.trim() ? parse($('#bond')) : null };
}

const rows = r => [
  ['tax', '취득 관련 세금', '취득세 · 지방교육세 · 농어촌특별세', won(r.acquisitionTotal), 'mint'],
  ['broker', '중개보수 상한', '실제 보수는 상한 내 협의 · 부가세 별도', won(r.brokerage), 'blue'],
  ['legal', '법무·등기 예상비', '법무사 보수와 등기 관련 예상 비용', won(r.legal), 'beige', '예상'],
  ['bond', '국민주택채권 할인비용', '시가표준액과 당일 할인율에 따라 변동', r.bond === null ? '별도 확인 필요' : won(r.bond), 'gray'],
  ['loan', '인지세 (대출 관련)', '금융기관과 절반 부담한 고객 예상액', won(r.loanStamp.customer), 'blue'],
  ['contract', '매매계약 인지세', '정보 제공용 · 부대비용 합계에서 제외', won(r.contractStamp), 'gray', '합계 제외']
];

function render() {
  current = calculate(getValues()); const r = current;
  $('#hero-price').textContent = shortWon(r.price);
  $('#extra-summary').innerHTML = `약 ${Math.round(r.incidental / 10_000).toLocaleString()}만원 <i>+ α</i>`;
  $('#grand-total').textContent = won(r.total);
  $('#cost-list').innerHTML = rows(r).map(([id,title,desc,value,color,badge]) => `<button class="cost-row" data-detail="${id}"><span class="cost-icon ${color}">↗</span><span class="cost-copy"><b>${title}${badge ? `<mark>${badge}</mark>`:''}</b><small>${desc}</small></span><strong>${value}</strong><i>›</i></button>`).join('');
  $('#cash-equation').innerHTML = `<span>${shortWon(r.price)}<small>매매가</small></span><i>−</i><span>${shortWon(r.paid)}<small>기지급금</small></span><i>−</i><span>${shortWon(r.loan)}<small>대출금</small></span><i>＋</i><span>${shortWon(r.incidental)}<small>부대비용</small></span>`;
  const invalid = r.loan + r.paid > r.price;
  $('#cash-total').textContent = invalid ? '입력값 확인 필요' : `약 ${shortWon(r.cash)}`;
  $('#cash-warning').hidden = !invalid; $('#cash-warning').textContent = '입력한 대출금 및 기지급금이 매매가를 초과합니다. 입력값을 확인해주세요.';
  document.querySelectorAll('[data-detail]').forEach(b => b.onclick = () => openDetail(b.dataset.detail));
}

const table = (headers, data) => `<div class="rate-table"><div>${headers.map(x=>`<b>${x}</b>`).join('')}</div>${data.map(row=>`<div>${row.map(x=>`<span>${x}</span>`).join('')}</div>`).join('')}</div>`;
function openDetail(type) {
  const r=current, pct=(r.rate*100).toFixed(4).replace(/0+$/,'').replace(/\.$/,''); let d={};
  if(type==='tax') d={title:'취득 관련 세금', amount:r.acquisitionTotal, conditions:`매매가 ${won(r.price)} · ${r.firstHome?'생애최초':'일반 구입'} · ${r.over85?'85㎡ 초과':'85㎡ 이하'}`, standard:`취득세율 ${pct}%${r.reduction?' · 생애최초 최대 200만원 감면':''}`, formula:`${won(r.acquisition)} + ${won(r.education)} + ${won(r.rural)}`, facts:[['감면 전 취득세',won(r.acquisitionBefore)],['생애최초 감면',`− ${won(r.reduction)}`],['최종 취득세',won(r.acquisition)],['지방교육세',won(r.education)],['농어촌특별세',won(r.rural)],['총 취득 관련 세금',won(r.acquisitionTotal)]], why:'주택의 실제 용도, 면적, 감면 요건 충족 여부에 따라 달라질 수 있습니다.', chart:table(['매매가','취득세율'],[['6억원 이하','1%'],['6억원 초과~9억원 이하','변동세율'],['9억원 초과','3%']])};
  if(type==='broker') d={title:'중개보수 상한',amount:r.brokerage,conditions:`매매가 ${won(r.price)}`,standard:`${r.broker.label} · 상한요율 ${(r.broker.rate*100).toFixed(1)}%`,formula:`${won(r.price)} × ${(r.broker.rate*100).toFixed(1)}% = ${won(r.brokerage)}`,facts:[['적용 구간',r.broker.label],['최대 중개보수',won(r.brokerage)]],why:'실제 중개보수는 상한 범위 내에서 중개사와 협의할 수 있습니다. 부가세는 별도입니다.',chart:table(['거래금액','상한요율'],[['5천만원 미만','0.6% (25만원)'],['5천만~2억원','0.5% (80만원)'],['2억~9억원','0.4%'],['9억~12억원','0.5%'],['12억~15억원','0.6%'],['15억원 이상','0.7%']])};
  if(type==='legal') d={title:'법무·등기 예상비',amount:r.legal,badge:'예상',conditions:`사용자 설정 금액 ${won(r.legal)}`,standard:'초기 설정값 800,000원',formula:'직접 입력한 예상 금액을 합계에 반영',facts:[['법무·등기 예상비',won(r.legal)]],why:'소유권이전등기의 난이도와 실제 법무사 견적에 따라 달라집니다.'};
  if(type==='bond') d={title:'국민주택채권 할인비용',amount:r.bond,conditions:`매매가 ${won(r.price)}`,standard:'사용자가 직접 입력한 경우에만 합계에 포함',formula:r.bond===null?'자동 추정하지 않음':`직접 입력 ${won(r.bond)}`,facts:[['현재 반영액',r.bond===null?'별도 확인 필요':won(r.bond)]],why:'정확한 비용은 시가표준액, 의무매입액 및 매도 시점의 당일 할인율 등에 따라 달라집니다.'};
  if(type==='loan') d={title:'인지세 (대출 관련)',amount:r.loanStamp.customer,conditions:`대출금 ${won(r.loan)}`,standard:r.loanStamp.label,formula:`총 인지세 ${won(r.loanStamp.total)} ÷ 2`,facts:[['대출금',won(r.loan)],['적용 구간',r.loanStamp.label],['총 인지세',won(r.loanStamp.total)],['금융기관 부담 예상',won(r.loanStamp.total-r.loanStamp.customer)],['고객 부담 예상',won(r.loanStamp.customer)]],why:'금융기관의 계약 조건과 인지세 처리 방식에 따라 달라질 수 있습니다.',chart:table(['대출금','고객 부담'],[['5천만원 이하','0원'],['5천만 초과~1억원','35,000원'],['1억 초과~10억원','75,000원'],['10억원 초과','175,000원']])};
  if(type==='contract') d={title:'매매계약 인지세',amount:r.contractStamp,conditions:`매매가 ${won(r.price)}`,standard:'1억원 초과~10억원 이하 15만원 · 10억원 초과 35만원',formula:`계약서 기재금액 기준 ${won(r.contractStamp)}`,facts:[['예상 인지세',won(r.contractStamp)],['부대비용 합계','포함하지 않음']],why:'실제 부담 방식은 계약 당사자 간 협의 등에 따라 다를 수 있습니다.'};
  const amount=d.amount===null?'별도 확인 필요':won(d.amount);
  $('#detail-content').innerHTML=`<p class="panel-eyebrow">COST DETAIL</p><h2 id="detail-title">${d.title} ${d.badge?`<mark>${d.badge}</mark>`:''}</h2><h3>${amount}</h3><section><label>내 입력조건</label><p>${d.conditions}</p></section><section><label>적용기준</label><p>${d.standard}</p></section><section><label>계산식</label><p class="formula">${d.formula}</p></section><section><label>세부 내역</label>${d.facts.map(x=>`<div class="fact"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</section>${d.chart?`<section><label>관련 요율표 / 기준표</label>${d.chart}</section>`:''}<section><label>왜 금액이 달라질 수 있나요?</label><p>${d.why}</p></section><div class="panel-notice">본 계산 결과는 참고용 예상 금액입니다. 계약 또는 잔금 전 관련 기관과 전문가를 통해 최종 확인하세요.</div>`;
  $('#overlay').hidden=false; document.body.classList.add('modal-open');
}

inputs.forEach(id => { const el=$(`#${id}`); el.addEventListener('input',()=>{syncInput(el); render();}); });
document.querySelectorAll('input[type=radio]').forEach(el=>el.addEventListener('change',render));
document.querySelectorAll('.chips').forEach(group=>group.addEventListener('click',e=>{if(!e.target.dataset.value)return; const el=$(`#${group.dataset.target}`);el.value=Number(e.target.dataset.value).toLocaleString();group.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===e.target));syncInput(el);render();}));
$('#calculator-form').addEventListener('submit',e=>{e.preventDefault();render();$('#results').scrollIntoView({behavior:'smooth'});});
function close(){ $('#overlay').hidden=true;document.body.classList.remove('modal-open'); }
$('.close-x').onclick=close;$('.close-bottom').onclick=close;$('#overlay').onclick=e=>{if(e.target===$('#overlay'))close();};document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
render();
