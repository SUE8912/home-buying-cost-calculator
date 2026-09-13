export function bindCalculationInteractions({
  moneyInputs,
  chipGroups,
  form,
  resolveInput,
  syncInput,
  render,
  scrollToResults
}) {
  moneyInputs.forEach(input => {
    input.addEventListener('input', () => syncInput(input));
  });

  chipGroups.forEach(group => {
    group.addEventListener('click', event => {
      if (!event.target.dataset.value) return;
      const input = resolveInput(group.dataset.target);
      input.value = Number(event.target.dataset.value).toLocaleString('ko-KR');
      group.querySelectorAll('button').forEach(button => {
        button.classList.toggle('active', button === event.target);
      });
      syncInput(input);
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    render();
    scrollToResults();
  });
}
