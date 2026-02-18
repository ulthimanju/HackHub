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
  const t = theme.alert[type] || theme.alert.info;
  const Icon = icons[type] || icons.info;
  return (
    <div className={`flex gap-3 p-4 ${t.wrapper}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${t.iconColor}`} />
      <div className="flex-1">
        <h4 className={`text-sm font-semibold mb-1 ${t.title}`}>{title}</h4>
        <p className={`text-sm ${t.body}`}>{children}</p>
      </div>
    </div>
  );
});
Alert.displayName = 'Alert';
export default Alert;
