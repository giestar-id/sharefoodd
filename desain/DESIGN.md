---
version: alpha
name: ShareFood
description: Responsive web application (desktop & mobile) · High-contrast forest-green
  and clean white surfaces with organic warm-cream public catalog sections, crisp
  1px borders, pill status badges, and centered modal workflows.
colors:
  primary: '#23865B'
  on-primary: '#FFFFFF'
  secondary: '#0A2617'
  background: '#F8FAF8'
  surface: '#FFFFFF'
  on-surface: '#202923'
  on-surface-muted: '#6D7A71'
  outline: '#E3EAE5'
  error: '#C94B45'
  success: '#23865B'
  scrim: '#0A2617'
  surface-dim: '#d3ddd3'
  surface-bright: '#f2fcf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf6ed'
  surface-container: '#e6f1e7'
  surface-container-high: '#e1ebe1'
  surface-container-highest: '#dbe5dc'
  on-surface-variant: '#3e4942'
  inverse-surface: '#29332c'
  inverse-on-surface: '#e9f3ea'
  outline-variant: '#bec9c0'
  surface-tint: '#006c46'
  primary-container: '#23865b'
  on-primary-container: '#ffffff'
  inverse-primary: '#7cd9a7'
  on-secondary: '#ffffff'
  secondary-container: '#caead2'
  on-secondary-container: '#4e6b58'
  tertiary: '#974247'
  on-tertiary: '#ffffff'
  tertiary-container: '#b65a5e'
  on-tertiary-container: '#ffffff'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#98f6c2'
  primary-fixed-dim: '#7cd9a7'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#005233'
  secondary-fixed: '#caead2'
  secondary-fixed-dim: '#afceb7'
  on-secondary-fixed: '#042012'
  on-secondary-fixed-variant: '#314d3b'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ffb3b4'
  on-tertiary-fixed: '#40010a'
  on-tertiary-fixed-variant: '#7b2c32'
  on-background: '#151e18'
  surface-variant: '#dbe5dc'
  primary-pressed: '#176644'
  badge-bg: '#E8F5ED'
typography:
  headline-lg:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  title-md:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.01em
  body-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  label-md:
    fontFamily: Montserrat
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0em
  caption:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
rounded:
  sm: 6px
  md: 12px
  lg: 20px
  full: 9999px
  DEFAULT: 0.5rem
  xl: 1.5rem
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: 12px 20px
    typography: '{typography.label-md}'
  button-primary-pressed:
    backgroundColor: '#176644'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: 12px 20px
    typography: '{typography.label-md}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    borderColor: '{colors.outline}'
    rounded: '{rounded.md}'
    padding: 12px 20px
    typography: '{typography.label-md}'
  button-danger:
    backgroundColor: '{colors.error}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: 12px 20px
    typography: '{typography.label-md}'
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.on-surface}'
    borderColor: '{colors.outline}'
    rounded: '{rounded.md}'
    padding: 11px 14px
    typography: '{typography.body-md}'
  card:
    backgroundColor: '{colors.surface}'
    borderColor: '{colors.outline}'
    rounded: '{rounded.lg}'
    padding: 20px
  table:
    backgroundColor: '{colors.surface}'
    borderColor: '{colors.outline}'
    rounded: '{rounded.lg}'
    rowHeight: 52px
    typography: '{typography.body-md}'
  status-badge:
    backgroundColor: '#E8F5ED'
    textColor: '{colors.primary}'
    rounded: '{rounded.full}'
    padding: 4px 10px
    typography: '{typography.caption}'
  modal-dialog:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: 24px
  modal-scrim:
    backgroundColor: '{colors.scrim}'
  confirm-dialog:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: 20px
---

