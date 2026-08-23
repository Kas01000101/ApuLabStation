export function getGameContainer(): HTMLElement | null {
  return document.getElementById('game-container');
}

export function clearApuLabDom(): void {
  document.querySelectorAll('[data-apulab-ui="true"]').forEach(node => node.remove());
}

export function createOverlay(id: string, html: string): HTMLDivElement | null {
  const container = getGameContainer();
  if (!container) return null;

  document.getElementById(id)?.remove();
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.dataset.apulabUi = 'true';
  overlay.className = 'apulab-overlay';
  overlay.innerHTML = html;
  container.appendChild(overlay);
  return overlay;
}

export function createPrimaryButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'apulab-btn-primary';
  button.innerText = label;
  button.onclick = onClick;
  return button;
}

export function createSecondaryButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'apulab-btn-secondary';
  button.innerText = label;
  button.onclick = onClick;
  return button;
}

export function createDisabledButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'apulab-btn-secondary';
  button.innerText = label;
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  return button;
}

export function dialogueBox(title: string, body: string): string {
  return `
    <div class="apulab-dialogue-box">
      <div class="apulab-dialogue-title">${title}</div>
      <div class="apulab-dialogue-body">${body}</div>
    </div>
  `;
}

export function challengeHeader(levelLabel: string, challengeLabel: string): string {
  return `
    <div class="apulab-challenge-header">
      <span>${levelLabel}</span>
      <strong>${challengeLabel}</strong>
    </div>
  `;
}

export function feedbackPanel(message = ''): string {
  return `<div class="apulab-feedback-panel">${message}</div>`;
}

export function progressIndicator(current: number, total: number): string {
  return `<div class="apulab-progress-indicator">Paso ${current} de ${total}</div>`;
}
