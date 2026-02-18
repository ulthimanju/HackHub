// Single source of truth for all design tokens.
// Edit this file to retheme the entire application.

export const theme = {
  primary: {
    bg:          'bg-orange-500',
    bgHover:     'hover:bg-orange-600',
    bgLight:     'bg-orange-50',
    text:        'text-orange-600',
    textDark:    'text-orange-900',
    textLight:   'text-orange-700',
    border:      'border-orange-500',
    borderLight: 'border-orange-200',
    icon:        'text-orange-500',
    shadow:      'shadow-orange-200/50',
    focus:       'focus:ring-orange-500',
    ring:        'ring-orange-200',
  },

  surface: {
    page:    'bg-gray-50',
    card:    'bg-white border border-gray-100 rounded-2xl',
    header:  'bg-white border-b border-gray-200 sticky top-0 z-10',
    sidebar: 'bg-white border-r border-gray-200',
    divider: 'border-gray-100',
  },

  text: {
    heading: 'font-bold text-gray-900',
    body:    'text-gray-700',
    muted:   'text-gray-500',
    label:   'text-sm font-semibold text-gray-700',
    tiny:    'text-xs text-gray-500',
  },

  radius: {
    sm:   'rounded-lg',
    md:   'rounded-xl',
    lg:   'rounded-2xl',
    xl:   'rounded-3xl',
    full: 'rounded-full',
  },

  focus: 'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',

  button: {
    primary:   'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200/50 active:scale-95',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95',
    outline:   'bg-white text-orange-600 border border-orange-500 hover:bg-orange-50 active:scale-95',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95',
    danger:    'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
  },

  badge: {
    info:      'bg-blue-50 text-blue-700 border-blue-200',
    success:   'bg-green-50 text-green-700 border-green-200',
    warning:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger:    'bg-red-50 text-red-700 border-red-200',
    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
    orange:    'bg-orange-50 text-orange-700 border-orange-200',
  },

  alert: {
    success: { wrapper: 'bg-green-50 border border-green-200 rounded-lg',   title: 'text-green-900', body: 'text-green-800', iconColor: 'text-green-600' },
    error:   { wrapper: 'bg-red-50 border border-red-200 rounded-lg',       title: 'text-red-900',   body: 'text-red-800',   iconColor: 'text-red-600'   },
    warning: { wrapper: 'bg-yellow-50 border border-yellow-200 rounded-lg', title: 'text-yellow-900', body: 'text-yellow-800', iconColor: 'text-yellow-600' },
    info:    { wrapper: 'bg-blue-50 border border-blue-200 rounded-lg',     title: 'text-blue-900',  body: 'text-blue-800',  iconColor: 'text-blue-600'  },
  },

  nav: {
    active:   'text-white bg-orange-500 hover:bg-orange-600 shadow-sm',
    inactive: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    icon:     'text-orange-500',
  },

  tab: {
    active:   'border-orange-500 text-orange-600',
    inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
  },

  statsCard: {
    orange: 'from-orange-50 to-white border-orange-100 text-orange-600',
    blue:   'from-blue-50 to-white border-blue-100 text-blue-600',
    purple: 'from-purple-50 to-white border-purple-100 text-purple-600',
  },
};
