import { DesignDirection, DesignSystemSpec } from '@/types';

/**
 * Builds a concrete, framework-ready DesignSystemSpec from a selected DesignDirection.
 */
export function buildDesignSystemSpec(direction: DesignDirection): DesignSystemSpec {
  const p = direction.palette;
  const t = direction.typography;
  const g = direction.geometry;

  const cssVariables: Record<string, string> = {
    '--flux-bg': p.background,
    '--flux-surface': p.surface,
    '--flux-surface-secondary': p.surfaceSecondary,
    '--flux-fg': p.foreground,
    '--flux-fg-muted': p.foregroundMuted,
    '--flux-primary': p.primary,
    '--flux-primary-fg': p.primaryForeground,
    '--flux-secondary': p.secondary,
    '--flux-secondary-fg': p.secondaryForeground,
    '--flux-accent': p.accent,
    '--flux-accent-fg': p.accentForeground,
    '--flux-border': p.border,
    '--flux-border-focus': p.borderFocus,
    '--flux-success': p.success,
    '--flux-warning': p.warning,
    '--flux-error': p.error,
    '--flux-radius': g.borderRadius,
    '--flux-border-width': g.borderWidth,
    '--flux-font-heading': `"${t.headingFont}", sans-serif`,
    '--flux-font-body': `"${t.bodyFont}", sans-serif`,
    '--flux-font-mono': `"${t.monoFont}", monospace`
  };

  // Generate button styles based on geometry variant
  let btnPrimary = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none ';
  let btnSecondary = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-1 disabled:opacity-50 disabled:pointer-events-none ';
  let btnGhost = 'inline-flex items-center justify-center font-medium transition-all hover:bg-white/5 disabled:opacity-50 ';

  if (g.buttonVariant === 'sharp-monochrome') {
    btnPrimary += 'bg-[var(--flux-primary)] text-[var(--flux-primary-fg)] px-4 py-2 text-sm tracking-wide uppercase font-bold hover:brightness-110 active:scale-[0.99] rounded-[var(--flux-radius)] border border-[var(--flux-primary)]';
    btnSecondary += 'bg-transparent text-[var(--flux-fg)] px-4 py-2 text-sm border border-[var(--flux-border)] hover:border-[var(--flux-fg)] rounded-[var(--flux-radius)]';
    btnGhost += 'text-[var(--flux-fg-muted)] hover:text-[var(--flux-fg)] px-3 py-2 text-sm rounded-[var(--flux-radius)]';
  } else if (g.buttonVariant === 'pill-glow') {
    btnPrimary += 'bg-[var(--flux-primary)] text-[var(--flux-primary-fg)] px-5 py-2.5 text-sm font-semibold shadow-[0_0_15px_rgba(var(--flux-primary),0.35)] hover:shadow-[0_0_25px_rgba(var(--flux-primary),0.55)] rounded-full active:scale-95';
    btnSecondary += 'bg-[var(--flux-surface-secondary)] text-[var(--flux-fg)] px-5 py-2.5 text-sm border border-[var(--flux-border)] hover:border-[var(--flux-primary)] rounded-full';
    btnGhost += 'text-[var(--flux-fg-muted)] hover:text-[var(--flux-accent)] px-4 py-2 text-sm rounded-full';
  } else if (g.buttonVariant === 'frosted-surface') {
    btnPrimary += 'bg-[var(--flux-primary)] text-[var(--flux-primary-fg)] px-4 py-2.5 text-sm font-medium shadow-sm hover:opacity-95 rounded-[var(--flux-radius)] backdrop-blur-md';
    btnSecondary += 'bg-[var(--flux-surface)] text-[var(--flux-fg)] px-4 py-2.5 text-sm border border-[var(--flux-border)] shadow-sm hover:bg-[var(--flux-surface-secondary)] rounded-[var(--flux-radius)]';
    btnGhost += 'text-[var(--flux-fg-muted)] hover:text-[var(--flux-fg)] px-3 py-2 text-sm rounded-[var(--flux-radius)]';
  } else {
    // Default crisp
    btnPrimary += 'bg-[var(--flux-primary)] text-[var(--flux-primary-fg)] px-4 py-2 text-sm rounded-[var(--flux-radius)] border border-transparent shadow-sm hover:opacity-90';
    btnSecondary += 'bg-[var(--flux-surface-secondary)] text-[var(--flux-fg)] px-4 py-2 text-sm rounded-[var(--flux-radius)] border border-[var(--flux-border)] hover:bg-[var(--flux-surface)]';
    btnGhost += 'text-[var(--flux-fg-muted)] hover:text-[var(--flux-fg)] px-3 py-2 text-sm rounded-[var(--flux-radius)]';
  }

  // Card styles
  const cardContainer = `bg-[var(--flux-surface)] text-[var(--flux-fg)] border border-[var(--flux-border)] rounded-[var(--flux-radius)] p-6 transition-colors shadow-[${g.shadowStyle}]`;
  const cardHeader = 'flex flex-col space-y-1.5 pb-4 border-b border-[var(--flux-border)]';
  const cardTitle = 'font-semibold tracking-tight text-[var(--flux-fg)]';

  // Input styles
  const inputStyles = 'flex h-10 w-full rounded-[var(--flux-radius)] border border-[var(--flux-border)] bg-[var(--flux-surface-secondary)] px-3 py-2 text-sm text-[var(--flux-fg)] placeholder:text-[var(--flux-fg-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--flux-border-focus)] focus:border-[var(--flux-border-focus)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

  // Badge styles
  const badgeStyles = 'inline-flex items-center rounded-[var(--flux-radius)] border border-[var(--flux-border)] px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none bg-[var(--flux-surface-secondary)] text-[var(--flux-fg)]';

  // Navbar styles
  const navbarStyles = 'sticky top-0 z-50 w-full border-b border-[var(--flux-border)] bg-[var(--flux-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--flux-surface)]/80';

  // Global CSS additions with theme definition
  const globalCssAdditions = `
/* ============================================================ */
/* FLUX DESIGN SYSTEM: ${direction.name.toUpperCase()} */
/* ============================================================ */

:root {
${Object.entries(cssVariables).map(([k, v]) => `  ${k}: ${v};`).join('\n')}
}

body {
  background-color: var(--flux-bg);
  color: var(--flux-fg);
  font-family: var(--flux-font-body);
  letter-spacing: -0.011em;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--flux-font-heading);
  letter-spacing: ${t.headingTracking};
}

code, kbd, samp, pre {
  font-family: var(--flux-font-mono);
}

/* Subtle focus ring style */
*:focus-visible {
  outline: 2px solid var(--flux-border-focus);
  outline-offset: 2px;
}
`.trim();

  return {
    directionId: direction.id,
    name: direction.name,
    cssVariables,
    tailwindThemeRules: {
      colors: {
        'flux-bg': 'var(--flux-bg)',
        'flux-surface': 'var(--flux-surface)',
        'flux-surface-secondary': 'var(--flux-surface-secondary)',
        'flux-fg': 'var(--flux-fg)',
        'flux-fg-muted': 'var(--flux-fg-muted)',
        'flux-primary': 'var(--flux-primary)',
        'flux-primary-fg': 'var(--flux-primary-fg)',
        'flux-secondary': 'var(--flux-secondary)',
        'flux-border': 'var(--flux-border)',
        'flux-accent': 'var(--flux-accent)'
      },
      borderRadius: {
        DEFAULT: 'var(--flux-radius)'
      }
    },
    globalCssAdditions,
    buttonStyles: {
      primary: btnPrimary,
      secondary: btnSecondary,
      ghost: btnGhost
    },
    cardStyles: {
      container: cardContainer,
      header: cardHeader,
      title: cardTitle
    },
    inputStyles,
    badgeStyles,
    navbarStyles,
    typographyClasses: {
      h1: `text-3xl font-bold tracking-[${t.headingTracking}] text-[var(--flux-fg)]`,
      h2: `text-2xl font-semibold tracking-[${t.headingTracking}] text-[var(--flux-fg)]`,
      h3: `text-xl font-medium tracking-[${t.headingTracking}] text-[var(--flux-fg)]`,
      body: `text-sm leading-[${t.bodyLeading}] text-[var(--flux-fg)]`,
      muted: 'text-xs text-[var(--flux-fg-muted)]',
      code: 'font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--flux-surface-secondary)] text-[var(--flux-accent)]'
    }
  };
}
