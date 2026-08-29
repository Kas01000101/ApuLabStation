const colors = {
  brand: {
    purple: '#2D2654',
    lavender: '#8E7DCE',
    cyan: '#49C9D7',
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
    primary: '#F4C75E',
    primaryHover: '#F7D06F',
    primaryPressed: '#DDB047',
    primaryBorder: '#FFE5A3',
    primaryShadow: '#D5A43D',
    primaryHighlight: '#FFF3C8',
    secondary: '#49C9D7',
    secondaryHover: '#5FD3DF',
    secondaryPressed: '#33B4C2',
    secondaryBorder: '#A8EDF1',
    secondaryShadow: '#269AAA',
    secondaryHighlight: '#C9F6F7',
    utilityDark: '#6960B8',
    utilityDarkHover: '#776EC4',
    utilityDarkPressed: '#5A51A7',
    utilityDarkBorder: '#A9A1DF',
    utilityDarkShadow: '#4E478F',
    utilityDarkHighlight: '#C6C0EC',
    utilityLight: '#9284D2',
    utilityLightHover: '#9F92DB',
    utilityLightPressed: '#8072C4',
    utilityLightBorder: '#C7BEEF',
    utilityLightShadow: '#7064AE',
    utilityLightHighlight: '#DDD7F7'
  },
  text: {
    primary: '#17133A',
    onDark: '#FFFFFF',
    muted: '#B8C2CC',
    accent: '#49C9D7'
  },
  feedback: {
    success: '#74D99F',
    warning: '#FFD166',
    error: '#FF7B6E'
  },
  border: {
    subtle: '#4D4288',
    focus: '#49C9D7',
    cream: '#FFF0B8'
  },
  input: {
    background: '#FFFDFB',
    border: '#C7BEEF',
    focusBorder: '#49C9D7',
    text: '#302A52',
    placeholder: '#8F86A8'
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

const typographyFamily = {
  // TODO(APULAB-FUTURE:POPPINS-ROUNDED)
  // Replace Poppins with the real Poppins Rounded family only when a legal font asset/package is available.
  // See docs/FUTURE_IMPLEMENTATION.md#poppins-rounded
  primary: 'Poppins, sans-serif'
} as const;

export const uiTokens = {
  colors,
  typography: {
    family: typographyFamily,
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    display: {
      family: typographyFamily.primary,
      weight: '700',
      xl: 52,
      lg: 40
    },
    heading: {
      family: typographyFamily.primary,
      weight: '700',
      size: 30
    },
    button: {
      family: typographyFamily.primary,
      weight: '600',
      size: 21
    },
    menuButton: {
      family: typographyFamily.primary,
      weight: '700',
      size: 24
    },
    modalTitle: {
      family: typographyFamily.primary,
      weight: '700',
      size: 30
    },
    label: {
      family: typographyFamily.primary,
      weight: '600',
      size: 17
    },
    input: {
      family: typographyFamily.primary,
      weight: '400',
      size: 18
    },
    support: {
      family: typographyFamily.primary,
      weight: '400',
      size: 15
    },
    narrative: {
      family: typographyFamily.primary,
      weight: '500',
      size: 20,
      style: 'italic'
    },
    body: {
      family: typographyFamily.primary,
      weight: '400',
      size: 20
    },
    small: {
      family: typographyFamily.primary,
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
      width: 1672,
      height: 941
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
      menuHover: 1.02,
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
    width: 340,
    height: 64,
    radius: 28,
    verticalGap: 14,
    innerPaddingHorizontal: 24,
    borderWidth: 2,
    borderAlpha: 0.82,
    shadowOffset: 4,
    shadowPressedOffset: 2,
    pressedYOffset: 2,
    highlightHeight: 8,
    textShadow: {
      color: 'rgba(11, 14, 38, 0.28)',
      blur: 2,
      offsetY: 1
    },
    variants: {
      primary: {
        body: colors.action.primary,
        hover: colors.action.primaryHover,
        pressed: colors.action.primaryPressed,
        border: colors.action.primaryBorder,
        shadow: colors.action.primaryShadow,
        highlight: colors.action.primaryHighlight,
        text: colors.text.onDark
      },
      secondary: {
        body: colors.action.secondary,
        hover: colors.action.secondaryHover,
        pressed: colors.action.secondaryPressed,
        border: colors.action.secondaryBorder,
        shadow: colors.action.secondaryShadow,
        highlight: colors.action.secondaryHighlight,
        text: colors.text.onDark
      },
      utilityDark: {
        body: colors.action.utilityDark,
        hover: colors.action.utilityDarkHover,
        pressed: colors.action.utilityDarkPressed,
        border: colors.action.utilityDarkBorder,
        shadow: colors.action.utilityDarkShadow,
        highlight: colors.action.utilityDarkHighlight,
        text: colors.text.onDark
      },
      utilityLight: {
        body: colors.action.utilityLight,
        hover: colors.action.utilityLightHover,
        pressed: colors.action.utilityLightPressed,
        border: colors.action.utilityLightBorder,
        shadow: colors.action.utilityLightShadow,
        highlight: colors.action.utilityLightHighlight,
        text: colors.text.onDark
      }
    }
  },
  hud: {
    challenge: {
      safeArea: {
        top: 56,
        right: 72,
        left: 72
      },
      controlHeight: 40,
      gap: 12,
      button: {
        radius: 13,
        borderWidth: 2,
        innerBorderWidth: 0,
        depthOffset: 3,
        depthPressedOffset: 1,
        pressedYOffset: 2,
        hoverYOffset: 0,
        hoverScale: 1,
        highlightHeight: 0,
        fontSize: 14,
        fontWeight: '600',
        variants: {
          yellowPrimary: {
            bodyTop: '#FFC95C',
            body: '#F6B93B',
            bodyBottom: '#F6B93B',
            hoverBodyTop: '#FFC95C',
            hoverBody: '#FFC95C',
            hoverBodyBottom: '#FFC95C',
            pressedBodyTop: '#F6B93B',
            pressedBody: '#F6B93B',
            pressedBodyBottom: '#F6B93B',
            border: '#D89A28',
            innerBorder: '#FFE4A3',
            depth: '#C78320',
            highlight: '#FFE4A3',
            glow: '#FFD76A',
            text: colors.text.onDark,
            iconMedallion: '#FFC94A',
            iconMedallionBorder: '#FFFFFF',
            icon: colors.text.onDark
          },
          blueIcon: {
            bodyTop: '#84E1F2',
            body: '#5ED3EA',
            bodyBottom: '#5ED3EA',
            hoverBodyTop: '#84E1F2',
            hoverBody: '#84E1F2',
            hoverBodyBottom: '#84E1F2',
            pressedBodyTop: '#5ED3EA',
            pressedBody: '#5ED3EA',
            pressedBodyBottom: '#5ED3EA',
            border: '#34AEC6',
            innerBorder: '#C2F3FC',
            depth: '#268FA5',
            highlight: '#C2F3FC',
            glow: '#8CEBFF',
            text: colors.text.onDark,
            iconMedallion: '#32C8EA',
            iconMedallionBorder: '#FFFFFF',
            icon: colors.text.onDark
          }
        }
      },
      explanationButton: {
        width: 170
      },
      iconButton: {
        size: 40,
        radius: 12
      },
      progress: {
        width: 56,
        height: 40,
        radius: 12,
        borderWidth: 2,
        depthOffset: 2,
        fontSize: 14,
        fontWeight: '600',
        bodyTop: '#B19AF2',
        body: '#9A7EEB',
        bodyBottom: '#9A7EEB',
        border: '#7960CD',
        innerBorder: '#DCD0FF',
        shadow: '#6950B8',
        highlight: '#DCD0FF',
        text: colors.text.onDark
      }
    }
  },
  accessModal: {
    width: 490,
    minHeight: 410,
    radius: 32,
    body: '#F4EEFF',
    bodyHighlight: '#FFFDFB',
    outerFrame: '#8E7DCE',
    innerBorder: '#EEE7FF',
    shadow: '#4E478F',
    headerBody: '#6960B8',
    headerBorder: '#C7BEEF',
    headerHighlight: '#DDD7F7',
    backdrop: 'rgba(30, 23, 62, 0.32)',
    inputWidth: 360,
    inputHeight: 54,
    inputRadius: 18,
    primaryButtonWidth: 320,
    primaryButtonHeight: 60,
    demoButtonWidth: 238,
    demoButtonHeight: 54,
    closeButtonSize: 42
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
