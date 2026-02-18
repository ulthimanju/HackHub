import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const NavItem = memo(({ icon: Icon, children, active, onClick, className = '', ...props }) => {
  const handleClick = (e) => { if (onClick) { e.preventDefault(); onClick(e); } };
  return (
    <a
      href="#"
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all ${active ? theme.nav.active : theme.nav.inactive} ${className}`}
      {...props}
    >
      <Icon className={`w-5 h-5 ${!active ? theme.nav.icon : ''}`} />
      {children}
    </a>
  );
});
NavItem.displayName = 'NavItem';
export default NavItem;
