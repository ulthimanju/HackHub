// Predefined hackathon theme constants — used for event creation and explore filters.
// Grouped by category for organised display in the form picker.

export const THEME_CATEGORIES = {
  'Technology': [
    'AI / Machine Learning', 'Web Development', 'Mobile Apps',
    'Cloud / DevOps', 'Cybersecurity', 'Blockchain / Web3',
    'IoT / Hardware', 'AR / VR', 'Data Science', 'Open Source',
  ],
  'Impact': [
    'Sustainability', 'Health Tech', 'FinTech', 'EdTech',
    'Social Good', 'Smart Cities', 'Accessibility',
  ],
  'Industry': [
    'Gaming', 'E-Commerce', 'AgriTech', 'LegalTech', 'GovTech',
  ],
  'General': [
    'Open Innovation', 'No Theme',
  ],
};

// Flat list for filters and lookups
export const ALL_THEMES = Object.values(THEME_CATEGORIES).flat();
