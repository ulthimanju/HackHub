import React, { memo } from 'react';
import { theme } from '../../../../utils/theme';

const Section = memo(({ title, children }) => (
  <div className={`${theme.surface.card} p-6`}>
    {title && <h3 className={`text-lg mb-4 ${theme.text.heading}`}>{title}</h3>}
    {children}
  </div>
));
Section.displayName = 'Section';
export default Section;
