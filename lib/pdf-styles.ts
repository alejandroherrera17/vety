import { StyleSheet } from '@react-pdf/renderer'
import { ThemeName, themes } from './themes/themes'

const brandPdfTheme = {
  background: '#ffffff',
  foreground: '#0b1724',
  card: '#f4faff',
  cardForeground: '#0b1724',
  primary: '#27ADF5',
  primaryForeground: '#ffffff',
  secondary: '#eaf7ff',
  secondaryForeground: '#0b1724',
  muted: '#dff2ff',
  mutedForeground: '#24546f',
  accent: '#d7efff',
  accentForeground: '#0b1724',
  destructive: '#F52727',
  destructiveForeground: '#ffffff',
  border: '#b8e2fb',
  success: '#27ADF5',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#0b1724',
  info: '#27ADF5',
  infoForeground: '#ffffff',
}

// Convert HSL to RGB for PDF (simplified conversion)
function hslToRgb(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `rgb(${r}, ${g}, ${b})`
}

// Parse HSL string and convert to RGB
function parseHsl(hslString: string): string {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return hslString

  const h = parseInt(match[1])
  const s = parseInt(match[2])
  const l = parseInt(match[3])

  return hslToRgb(h, s, l)
}

export function createPdfStyles(themeName: ThemeName, mode: 'light' | 'dark' = 'light') {
  const theme = { ...themes[themeName][mode], ...brandPdfTheme }

  return StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: parseHsl(theme.background),
      color: parseHsl(theme.foreground),
      fontFamily: 'Helvetica',
    },
    header: {
      backgroundColor: parseHsl(theme.primary),
      color: parseHsl(theme.primaryForeground),
      padding: 20,
      marginBottom: 20,
      borderRadius: 8,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    headerSubtitle: {
      fontSize: 12,
      opacity: 0.8,
    },
    section: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: parseHsl(theme.card),
      borderRadius: 6,
      border: `1px solid ${parseHsl(theme.border)}`,
    },
    grid: {
      flexDirection: 'row',
      gap: 10,
    },
    column: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: parseHsl(theme.cardForeground),
      marginBottom: 10,
      borderBottom: `2px solid ${parseHsl(theme.primary)}`,
      paddingBottom: 5,
    },
    table: {
      marginTop: 10,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: parseHsl(theme.muted),
      padding: 8,
      fontWeight: 'bold',
      fontSize: 10,
      color: parseHsl(theme.mutedForeground),
      borderBottom: `1px solid ${parseHsl(theme.border)}`,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1px solid ${parseHsl(theme.border)}`,
      fontSize: 9,
    },
    tableCell: {
      color: parseHsl(theme.foreground),
      flex: 1,
    },
    wideCell: {
      color: parseHsl(theme.foreground),
      flex: 2,
    },
    badge: {
      backgroundColor: parseHsl(theme.primary),
      color: parseHsl(theme.primaryForeground),
      padding: '2 6',
      borderRadius: 4,
      fontSize: 8,
      fontWeight: 'bold',
    },
    badgeSuccess: {
      backgroundColor: parseHsl(theme.success),
      color: parseHsl(theme.successForeground),
    },
    badgeWarning: {
      backgroundColor: parseHsl(theme.warning),
      color: parseHsl(theme.warningForeground),
    },
    badgeInfo: {
      backgroundColor: parseHsl(theme.info),
      color: parseHsl(theme.infoForeground),
    },
    footer: {
      marginTop: 30,
      padding: 15,
      backgroundColor: parseHsl(theme.secondary),
      borderRadius: 6,
      textAlign: 'center',
      fontSize: 8,
      color: parseHsl(theme.secondaryForeground),
    },
    divider: {
      borderBottom: `1px solid ${parseHsl(theme.border)}`,
      marginVertical: 10,
    },
    highlight: {
      backgroundColor: parseHsl(theme.accent),
      color: parseHsl(theme.accentForeground),
      padding: 2,
      borderRadius: 2,
    },
    value: {
      fontSize: 9,
      lineHeight: 1.4,
      marginBottom: 7,
      color: parseHsl(theme.foreground),
    },
    qr: {
      width: 54,
      height: 54,
      border: `1px solid ${parseHsl(theme.border)}`,
      borderRadius: 8,
      textAlign: 'center',
      paddingTop: 21,
      color: parseHsl(theme.mutedForeground),
      fontSize: 7,
    },
    timelineItem: {
      borderLeft: `2px solid ${parseHsl(theme.primary)}`,
      paddingLeft: 10,
      paddingBottom: 10,
      marginBottom: 2,
    },
    row: {
      flexDirection: 'row',
      borderBottom: `1px solid ${parseHsl(theme.border)}`,
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    cell: {
      flex: 1,
      lineHeight: 1.4,
    }
  })
}

// Default styles for when theme is not available
export const defaultPdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#0b1724',
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#27ADF5',
    color: '#ffffff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f4faff',
    borderRadius: 6,
    border: '1px solid #b8e2fb',
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '2px solid #27ADF5',
    paddingBottom: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dff2ff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
    borderBottom: '1px solid #b8e2fb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1px solid #b8e2fb',
    fontSize: 9,
  },
  tableCell: {
    color: '#0b1724',
    flex: 1,
  },
  wideCell: {
    color: '#0b1724',
    flex: 2,
  },
  badge: {
    backgroundColor: '#27ADF5',
    color: '#ffffff',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#27ADF5',
    color: '#ffffff',
  },
  badgeWarning: {
    backgroundColor: '#ffc107',
    color: '#0b1724',
  },
  badgeInfo: {
    backgroundColor: '#27ADF5',
    color: '#ffffff',
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f4faff',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 8,
    color: '#24546f',
  },
  divider: {
    borderBottom: '1px solid #b8e2fb',
    marginVertical: 10,
  },
  highlight: {
    backgroundColor: '#d7efff',
    color: '#0b1724',
    padding: 2,
    borderRadius: 2,
  },
  value: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 7,
    color: '#0b1724',
  },
  qr: {
    width: 54,
    height: 54,
    border: '1px solid #b8e2fb',
    borderRadius: 8,
    textAlign: 'center',
    paddingTop: 21,
    color: '#24546f',
    fontSize: 7,
  },
  timelineItem: {
    borderLeft: '2px solid #27ADF5',
    paddingLeft: 10,
    paddingBottom: 10,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1px solid #b8e2fb',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cell: {
    flex: 1,
    lineHeight: 1.4,
  },
})
