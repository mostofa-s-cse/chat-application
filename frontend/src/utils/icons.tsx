import React from 'react';
import { IconType, IconBaseProps } from 'react-icons';

export const renderIcon = (IconComponent: IconType, className?: string) => {
  const Icon = IconComponent as React.ComponentType<IconBaseProps>;
  return <Icon className={className} />;
}; 