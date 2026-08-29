import { uiTokens } from '../tokens';
import { createOverlay } from '../domComponents';

export interface AccessModalOptions {
  onStudySubmit: (code: string, credential: string) => Promise<boolean>;
  onDemoSubmit: () => Promise<boolean>;
  onClose: () => void;
  onButtonPress?: () => void;
}

export class AccessModal {
  private readonly overlay: HTMLDivElement;
  private readonly abortController = new AbortController();
  private isClosing = false;

  constructor(private readonly options: AccessModalOptions) {
    const overlay = createOverlay('main-menu-mission-modal', this.createMarkup());
    if (!overlay) {
      throw new Error('access_modal_container_missing');
    }

    this.overlay = overlay;
    this.overlay.classList.add('apulab-overlay--mission');
    this.applyTokenVariables();
    this.bindEvents();
    this.codeInput?.focus();
  }

  public setError(message: string): void {
    const error = this.errorElement;
    if (error) error.innerText = message;
  }

  public close(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    this.abortController.abort();
    this.overlay.classList.add('apulab-overlay--closing');
    window.setTimeout(() => {
      this.overlay.remove();
      this.options.onClose();
    }, uiTokens.motion.duration.normal);
  }

  private bindEvents(): void {
    const signal = this.abortController.signal;

    this.closeButton?.addEventListener('click', () => this.close(), { signal });
    this.submitButton?.addEventListener('click', () => this.submitStudy(), { signal });
    this.demoButton?.addEventListener('click', () => this.submitDemo(), { signal });
    this.closeButton?.addEventListener('pointerdown', () => this.options.onButtonPress?.(), { signal });
    this.submitButton?.addEventListener('pointerdown', () => this.options.onButtonPress?.(), { signal });
    this.demoButton?.addEventListener('pointerdown', () => this.options.onButtonPress?.(), { signal });

    this.codeInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.credentialInput?.focus();
    }, { signal });

    this.credentialInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.submitStudy();
    }, { signal });

    this.overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    }, { signal });
  }

  private async submitStudy(): Promise<void> {
    this.setError('');
    const completed = await this.options.onStudySubmit(
      this.codeInput?.value.trim() ?? '',
      this.credentialInput?.value ?? ''
    );
    if (completed) this.abortController.abort();
  }

  private async submitDemo(): Promise<void> {
    this.setError('');
    const completed = await this.options.onDemoSubmit();
    if (completed) this.abortController.abort();
  }

  private createMarkup(): string {
    return `
      <div class="apulab-access-shell" role="dialog" aria-modal="true" aria-labelledby="mission-modal-title">
        <button id="main-menu-modal-close" class="apulab-access-close" type="button" aria-label="Cerrar">X</button>

        <div class="apulab-access-header">
          <span id="mission-modal-title">INICIAR MISIÓN</span>
        </div>

        <div class="apulab-access-body">
          <label class="apulab-access-label" for="main-menu-code-input">Código de participante</label>
          <input type="text" id="main-menu-code-input" class="apulab-access-input" placeholder="Ingresa tu código" maxlength="32" autocomplete="off" />

          <label class="apulab-access-label" for="main-menu-credential-input">Contraseña</label>
          <input type="password" id="main-menu-credential-input" class="apulab-access-input" placeholder="Ingresa tu contraseña" maxlength="64" autocomplete="off" />

          <div id="main-menu-code-error" class="apulab-access-error"></div>

          <button id="main-menu-submit-code" class="apulab-access-button apulab-access-button--primary" type="button">Continuar</button>

          <div class="apulab-access-demo-copy">¿No tienes credenciales?</div>
          <button id="main-menu-demo-mode" class="apulab-access-button apulab-access-button--demo" type="button">Modo demo</button>
        </div>
      </div>
    `;
  }

  private applyTokenVariables(): void {
    const modal = uiTokens.accessModal;
    const button = uiTokens.button.variants;
    const input = uiTokens.colors.input;
    const typography = uiTokens.typography;

    this.overlay.style.setProperty('--access-font-family', typography.family.primary);
    this.overlay.style.setProperty('--access-title-size', `${typography.modalTitle.size}px`);
    this.overlay.style.setProperty('--access-title-weight', typography.modalTitle.weight);
    this.overlay.style.setProperty('--access-label-size', `${typography.label.size}px`);
    this.overlay.style.setProperty('--access-label-weight', typography.label.weight);
    this.overlay.style.setProperty('--access-input-font-size', `${typography.input.size}px`);
    this.overlay.style.setProperty('--access-input-font-weight', typography.input.weight);
    this.overlay.style.setProperty('--access-button-font-size', `${typography.button.size}px`);
    this.overlay.style.setProperty('--access-button-font-weight', typography.button.weight);
    this.overlay.style.setProperty('--access-support-size', `${typography.support.size}px`);
    this.overlay.style.setProperty('--access-support-weight', typography.support.weight);
    this.overlay.style.setProperty('--access-backdrop', modal.backdrop);
    this.overlay.style.setProperty('--access-width', `${modal.width}px`);
    this.overlay.style.setProperty('--access-min-height', `${modal.minHeight}px`);
    this.overlay.style.setProperty('--access-radius', `${modal.radius}px`);
    this.overlay.style.setProperty('--access-body', modal.body);
    this.overlay.style.setProperty('--access-body-highlight', modal.bodyHighlight);
    this.overlay.style.setProperty('--access-outer-frame', modal.outerFrame);
    this.overlay.style.setProperty('--access-inner-border', modal.innerBorder);
    this.overlay.style.setProperty('--access-shadow', modal.shadow);
    this.overlay.style.setProperty('--access-header-body', modal.headerBody);
    this.overlay.style.setProperty('--access-header-border', modal.headerBorder);
    this.overlay.style.setProperty('--access-header-highlight', modal.headerHighlight);
    this.overlay.style.setProperty('--access-input-width', `${modal.inputWidth}px`);
    this.overlay.style.setProperty('--access-input-height', `${modal.inputHeight}px`);
    this.overlay.style.setProperty('--access-input-radius', `${modal.inputRadius}px`);
    this.overlay.style.setProperty('--access-primary-width', `${modal.primaryButtonWidth}px`);
    this.overlay.style.setProperty('--access-primary-height', `${modal.primaryButtonHeight}px`);
    this.overlay.style.setProperty('--access-demo-width', `${modal.demoButtonWidth}px`);
    this.overlay.style.setProperty('--access-demo-height', `${modal.demoButtonHeight}px`);
    this.overlay.style.setProperty('--access-close-size', `${modal.closeButtonSize}px`);
    this.overlay.style.setProperty('--access-input-bg', input.background);
    this.overlay.style.setProperty('--access-input-border', input.border);
    this.overlay.style.setProperty('--access-input-focus', input.focusBorder);
    this.overlay.style.setProperty('--access-input-text', input.text);
    this.overlay.style.setProperty('--access-input-placeholder', input.placeholder);
    this.overlay.style.setProperty('--access-primary-body', button.primary.body);
    this.overlay.style.setProperty('--access-primary-hover', button.primary.hover);
    this.overlay.style.setProperty('--access-primary-border', button.primary.border);
    this.overlay.style.setProperty('--access-primary-highlight', button.primary.highlight);
    this.overlay.style.setProperty('--access-primary-shadow', button.primary.shadow);
    this.overlay.style.setProperty('--access-demo-body', button.utilityLight.body);
    this.overlay.style.setProperty('--access-demo-hover', button.utilityLight.hover);
    this.overlay.style.setProperty('--access-demo-border', button.utilityLight.border);
    this.overlay.style.setProperty('--access-demo-highlight', button.utilityLight.highlight);
    this.overlay.style.setProperty('--access-demo-shadow', button.utilityLight.shadow);
  }

  private get codeInput(): HTMLInputElement | null {
    return document.getElementById('main-menu-code-input') as HTMLInputElement | null;
  }

  private get credentialInput(): HTMLInputElement | null {
    return document.getElementById('main-menu-credential-input') as HTMLInputElement | null;
  }

  private get errorElement(): HTMLElement | null {
    return document.getElementById('main-menu-code-error');
  }

  private get submitButton(): HTMLElement | null {
    return document.getElementById('main-menu-submit-code');
  }

  private get demoButton(): HTMLElement | null {
    return document.getElementById('main-menu-demo-mode');
  }

  private get closeButton(): HTMLElement | null {
    return document.getElementById('main-menu-modal-close');
  }
}
