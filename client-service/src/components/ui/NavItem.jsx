import React from 'react';

const NavItem = ({ icon: Icon, children, active, ...props }) => {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'text-white bg-orange-500'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      {...props}
    >
      <Icon className={`w-5 h-5 ${!active ? 'text-orange-500' : ''}`} />
      {children}
    </a>
  );
};

export default NavItem;
