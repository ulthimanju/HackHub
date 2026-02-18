import React from 'react';

const NavItem = ({ icon: Icon, children, active, onClick, className = '', ...props }) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${
        active
          ? 'text-white bg-orange-500 hover:bg-orange-600 hover:text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
      {...props}
    >
      <Icon className={`w-5 h-5 ${!active ? 'text-orange-500' : ''}`} />
      {children}
    </a>
  );
};

export default NavItem;
