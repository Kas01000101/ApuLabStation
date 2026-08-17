const colors = {
  brand: {
    purple: '#2D2654',
    lavender: '#8E7DCE',
    cyan: '#4EDDE8',
    cream: '#FFF7E8'
  },
  surface: {
    page: '#FFFFFF',
    deep: '#0B0E26',
    panel: '#2D2654',
    panelRaised: '#3B326B',
    panelMuted: '#141938',
    overlay: '#0B0E26'
  },
  action: {
    primary: '#FFD166',
    primaryHover: '#FFE38A',
    primaryPressed: '#E5B64E',
    primaryBorder: '#FFF0B8',
    primaryShadow: '#C99935',
    secondary: '#4EDDE8',
    secondaryHover: '#75EAF2',
    secondaryPressed: '#2CBAC7',
    secondaryBorder: '#BDF8FC',
    secondaryShadow: '#2097A3',
    utilityDark: '#3B326B',
    utilityDarkHover: '#4D4288',
    utilityDarkPressed: '#2D2654',
    utilityDarkBorder: '#7163AD',
    utilityDarkShadow: '#211B41',
    utilityLight: '#8E7DCE',
    utilityLightHover: '#A696E0',
    utilityLightPressed: '#7563B6',
    utilityLightBorder: '#C8BEF1',
    utilityLightShadow: '#5C4C99'
  },
  text: {
    primary: '#17133A',
    onDark: '#FFF7E8',
    muted: '#B8C2CC',
    accent: '#4EDDE8'
  },
  feedback: {
    success: '#74D99F',
    warning: '#FFD166',
    error: '#FF7B6E'
  },
  border: {
    subtle: '#4D4288',
    focus: '#4EDDE8',
    cream: '#FFF0B8'
  },
  shadow: {
    soft: 'rgba(11, 14, 38, 0.22)',
    medium: 'rgba(11, 14, 38, 0.35)',
    deep: 'rgba(11, 14, 38, 0.5)'
  },
  highlight: {
    soft: '#FFFFFF',
    warm: '#FFF7E8'
  }
} as const;

export const uiTokens = {
  colors,
  typography: {
    display: {
      family: 'Fredoka, sans-serif',
      weight: '700',
      xl: 52,
      lg: 40
    },
    heading: {
      family: 'Fredoka, sans-serif',
      weight: '700',
      size: 30
    },
    button: {
      family: 'Fredoka, sans-serif',
      weight: '600',
      size: 26
    },
    body: {
      family: 'Nunito Sans, sans-serif',
      weight: '400',
      size: 20
    },
    small: {
      family: 'Nunito Sans, sans-serif',
      weight: '400',
      size: 15
    }
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: {
    small: 8,
    medium: 16,
    large: 28,
    pill: 999
  },
  sizes: {
    canvas: {
      width: 1280,
      height: 720
    }
  },
  motion: {
    duration: {
      fast: 120,
      normal: 180,
      slow: 260
    },
    ease: {
      out: 'Sine.easeOut'
    },
    scale: {
      normal: 1,
      hover: 1.025,
      pressed: 0.97
    }
  },
  elevation: {
    small: {
      y: 4,
      blur: 12,
      color: colors.shadow.soft
    },
    medium: {
      y: 12,
      blur: 32,
      color: colors.shadow.medium
    },
    button: {
      alpha: 0.82
    }
  },
  button: {
    width: 360,
    height: 72,
    radius: 28,
    verticalGap: 16,
    borderWidth: 3,
    borderAlpha: 0.72,
    shadowOffset: 6,
    shadowPressedOffset: 3,
    pressedYOffset: 2,
    highlightHeight: 10,
    variants: {
      primary: {
        body: colors.action.primary,
        hover: colors.action.primaryHover,
        pressed: colors.action.primaryPressed,
        border: colors.action.primaryBorder,
        shadow: colors.action.primaryShadow,
        text: colors.text.primary
      },
      secondary: {
        body: colors.action.secondary,
        hover: colors.action.secondaryHover,
        pressed: colors.action.secondaryPressed,
        border: colors.action.secondaryBorder,
        shadow: colors.action.secondaryShadow,
        text: colors.text.primary
      },
      utilityDark: {
        body: colors.action.utilityDark,
        hover: colors.action.utilityDarkHover,
        pressed: colors.action.utilityDarkPressed,
        border: colors.action.utilityDarkBorder,
        shadow: colors.action.utilityDarkShadow,
        text: colors.text.onDark
      },
      utilityLight: {
        body: colors.action.utilityLight,
        hover: colors.action.utilityLightHover,
        pressed: colors.action.utilityLightPressed,
        border: colors.action.utilityLightBorder,
        shadow: colors.action.utilityLightShadow,
        text: colors.text.onDark
      }
    }
  }
} as const;

export const UI_TOKENS = {
  colors: {
    backgroundDark: colors.surface.deep,
    backgroundPanel: colors.surface.panelMuted,
    panel: colors.surface.panel,
    panelBorder: colors.border.subtle,
    accent: colors.brand.cyan,
    warning: colors.feedback.warning,
    danger: colors.feedback.error,
    text: colors.text.onDark,
    muted: colors.text.muted
  },
  typography: {
    heading: uiTokens.typography.display.family,
    body: uiTokens.typography.body.family
  },
  spacing: {
    xs: uiTokens.spacing.xs,
    sm: uiTokens.spacing.sm,
    md: uiTokens.spacing.md,
    lg: uiTokens.spacing.xl
  },
  layout: {
    width: uiTokens.sizes.canvas.width,
    height: uiTokens.sizes.canvas.height,
    cardRadius: uiTokens.radius.medium,
    buttonRadius: uiTokens.radius.pill
  }
} as const;
