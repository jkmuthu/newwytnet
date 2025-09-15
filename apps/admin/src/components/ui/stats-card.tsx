interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

export default function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-full flex items-center justify-center`}>
          <i className={`fas fa-${icon}`}></i>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          } mr-1`}></i>
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      )}
    </div>
  );
}
