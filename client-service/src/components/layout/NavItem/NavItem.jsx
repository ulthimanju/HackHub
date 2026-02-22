import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const NavItem = memo(({ icon: Icon, children, active, onClick, className = '', ...props }) => {
  const handleClick = (e) => { if (onClick) { e.preventDefault(); onClick(e); } };
  return (
    <a
      href="#"
      onClick={handleClick}
      className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
        active ? theme.nav.active : theme.nav.inactive
      } ${className}`}
      {...props}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? theme.nav.iconActive : theme.nav.icon}`} />
      <span>{children}</span>
    </a>
  );
});

NavItem.displayName = 'NavItem';
export default NavItem;
