import React, { memo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { theme } from '../../../utils/theme';

const icons = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const Alert = memo(({ type = 'info', title, children }) => {
  const t = theme.alert[type] ?? theme.alert.info;
  const Icon = icons[type] ?? icons.info;
  return (
    <div className={`flex gap-3 p-4 ${t.wrapper}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${t.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold leading-snug ${t.title}`}>{title}</p>}
        {children && <p className={`text-sm mt-0.5 ${t.body}`}>{children}</p>}
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';
export default Alert;
