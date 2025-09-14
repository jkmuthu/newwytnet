import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface MobileAdminCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MobileAdminCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  action,
  variant = 'default',
  className
}: MobileAdminCardProps) {
  const variantStyles = {
    default: 'border-gray-200 dark:border-gray-700',
    success: 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
    warning: 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <Card className={cn('touch-manipulation', variantStyles[variant], className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {icon && (
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
            </div>
          </div>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {trend && (
              <Badge
                variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : trend.direction === 'down' ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : null}
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend?.label && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  badge,
  disabled = false
}: QuickActionCardProps) {
  return (
    <Card 
      className={cn(
        'touch-manipulation cursor-pointer transition-all hover:shadow-md',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}