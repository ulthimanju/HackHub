// Single source of truth for all design tokens.
// Edit this file to retheme the entire application.
// Colours reference the custom scales defined in tailwind.config.js.

export const theme = {
  primary: {
    bg:          'bg-brand-500',
    bgHover:     'hover:bg-brand-600',
    bgLight:     'bg-brand-50',
    text:        'text-brand-600',
    textDark:    'text-brand-700',
    textLight:   'text-brand-500',
    border:      'border-brand-500',
    borderLight: 'border-brand-200',
    icon:        'text-brand-500',
    shadow:      'shadow-btn-brand',
    focus:       'focus:ring-brand-500',
    ring:        'ring-brand-200',
  },

  surface: {
    page:    'bg-surface-page',
    card:    'bg-white border border-surface-border rounded-xl shadow-card',
    header:  'bg-white border-b border-surface-border',
    sidebar: 'bg-white border-r border-surface-border',
    divider: 'border-surface-border',
  },

  text: {
    heading: 'font-display font-semibold text-ink-primary',
    body:    'text-ink-secondary',
    muted:   'text-ink-muted',
    label:   'text-xs font-medium text-ink-muted uppercase tracking-wide',
    tiny:    'text-xs text-ink-muted',
  },

  radius: {
    sm:   'rounded-md',
    md:   'rounded-lg',
    lg:   'rounded-xl',
    xl:   'rounded-2xl',
    full: 'rounded-full',
  },

  focus: 'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',

  button: {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-btn-brand active:scale-[0.98]',
    secondary: 'bg-white text-ink-secondary border border-surface-border hover:bg-surface-hover active:bg-surface-active active:scale-[0.98]',
    outline:   'bg-white text-brand-600 border border-brand-300 hover:bg-brand-50 active:bg-brand-100 active:scale-[0.98]',
    ghost:     'bg-transparent text-ink-muted hover:bg-surface-hover hover:text-ink-secondary active:bg-surface-active active:scale-[0.98]',
    danger:    'bg-white text-red-600 border border-red-200 hover:bg-red-50 active:bg-red-100 active:scale-[0.98]',
  },

  badge: {
    info:      'bg-blue-50 text-blue-700 border-blue-200',
    success:   'bg-green-50 text-green-700 border-green-200',
    warning:   'bg-amber-50 text-amber-700 border-amber-200',
    danger:    'bg-red-50 text-red-700 border-red-200',
    secondary: 'bg-surface-hover text-ink-secondary border-surface-border',
    orange:    'bg-brand-50 text-brand-700 border-brand-200',
  },

  alert: {
    success: { wrapper: 'bg-green-50 border-l-4 border-green-500 rounded-lg',   title: 'text-green-900', body: 'text-green-800', iconColor: 'text-green-600' },
    error:   { wrapper: 'bg-red-50 border-l-4 border-red-500 rounded-lg',       title: 'text-red-900',   body: 'text-red-800',   iconColor: 'text-red-600'   },
    warning: { wrapper: 'bg-amber-50 border-l-4 border-amber-500 rounded-lg',   title: 'text-amber-900', body: 'text-amber-800', iconColor: 'text-amber-600' },
    info:    { wrapper: 'bg-blue-50 border-l-4 border-blue-500 rounded-lg',     title: 'text-blue-900',  body: 'text-blue-800',  iconColor: 'text-blue-600'  },
  },

  nav: {
    active:   'bg-surface-hover text-ink-primary font-medium border-l-2 border-brand-500',
    inactive: 'text-ink-muted border-l-2 border-transparent hover:bg-surface-hover hover:text-ink-secondary',
    icon:     'text-ink-muted',
    iconActive: 'text-brand-500',
  },

  tab: {
    active:   'border-brand-500 text-brand-600',
    inactive: 'border-transparent text-ink-muted hover:text-ink-secondary hover:border-surface-border',
  },

  statsCard: {
    orange: 'bg-white border-surface-border text-brand-600',
    blue:   'bg-white border-surface-border text-blue-600',
    purple: 'bg-white border-surface-border text-purple-600',
  },
};
