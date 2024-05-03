import { pxToRem, responsiveFontSizes } from '../utils/getFontValue';

// ----------------------------------------------------------------------

const FONT_PRIMARY = 'Synthese-Book, sans-serif'; // Google Font
// const FONT_PRIMARY = 'Public Sans, sans-serif'; // Google Font
// const FONT_SECONDARY = 'CircularStd, sans-serif'; // Local Font

const typography = {
  fontFamily: FONT_PRIMARY,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: {
    fontFamily: 'FlechaM-Medium',
    color: '#2EFFB4',
    fontWeight: 500,
    fontSize: pxToRem(44),
    lineHeight: 72 / 56,
    letterSpacing: 0,
    ...responsiveFontSizes({ sm: 44, md: 56, lg: 56 }),
  },
  h2: {
    fontFamily: 'FlechaM-Medium',
    color: '#1D472E',
    fontWeight: 500,
    fontSize: pxToRem(44),
    lineHeight: 72 / 56,
    letterSpacing: 0,
    ...responsiveFontSizes({ sm: 44, md: 56, lg: 56 }),
  },
  h3: {
    fontFamily: 'Synthese-Regular',
    fontWeight: 400,
    fontSize: pxToRem(40),
    lineHeight: 60 / 52,
    letterSpacing: 0,
    ...responsiveFontSizes({ sm: 40, md: 48, lg: 48 }),
  },
  h4: {
    fontFamily: 'Synthese-Book',
    color: ' #1D472E',
    fontSize: pxToRem(32),
    fontWeight: 400,
    lineHeight: 54 / 36,
    ...responsiveFontSizes({ sm: 32, md: 36, lg: 36 }),
  },
  h5: {
    fontFamily: 'Synthese-Regular',
    color: ' #1D472E',
    fontSize: pxToRem(14),
    fontWeight: 400,
    lineHeight: 20 / 14,
    ...responsiveFontSizes({ sm: 14, md: 14, lg: 14 }),
  },
  h6: {
    fontFamily: 'Synthese-Book',
    color: ' #161716',
    fontSize: pxToRem(16),
    fontWeight: 400,
    lineHeight: 24 / 16,
    ...responsiveFontSizes({ sm: 16, md: 16, lg: 16 }),
  },
  subtitle1: {
    fontFamily: 'Synthese-Bold',
    color: ' #1D472E',
    fontSize: pxToRem(16),
    fontWeight: 700,
    letterSpacing:' -0.01rem',
    lineHeight: 24 / 18,
    ...responsiveFontSizes({ sm: 16, md: 16, lg: 16 }),
  },
  subtitle2: {
    fontFamily: 'Synthese-Bold',
    color: ' #626E60',
    fontSize: pxToRem(18),
    fontWeight: 700,
    lineHeight: 28 / 18,
    ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 }),
  },
  body1: {
    fontFamily: 'Synthese-Book',
    color: ' #626E60',
    fontSize: pxToRem(18),
    fontWeight: 400,
    letterSpacing: '0.01rem',
    lineHeight: 28 / 18,
    ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 }),
  },
  body2: {
    fontFamily: 'Synthese-Book',
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  caption: {
    fontFamily: 'Synthese-Book',
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: 700,
    lineHeight: 24 / 14,
    fontSize: pxToRem(14),
    textTransform: 'capitalize',
  },
} as const;

export default typography;
