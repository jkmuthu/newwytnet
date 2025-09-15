interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'model': return { icon: 'cube', color: 'blue' };
    case 'app': return { icon: 'mobile-alt', color: 'green' };
    case 'hub': return { icon: 'network-wired', color: 'purple' };
    case 'page': return { icon: 'edit', color: 'yellow' };
    default: return { icon: 'info-circle', color: 'gray' };
  }
};

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    activities = [
      {
        id: '1',
        message: 'New module "Contact" created',
        timestamp: '2 hours ago',
        type: 'model'
      },
      {
        id: '2',
        message: 'App "WytCRM" published to marketplace',
        timestamp: '4 hours ago',
        type: 'app'
      },
      {
        id: '3',
        message: 'Hub "OwnerNET" reached 1000 members',
        timestamp: '1 day ago',
        type: 'hub'
      }
    ];
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const { icon, color } = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${colorClasses[color as keyof typeof colorClasses]} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`fas fa-${icon} text-xs`}></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground" data-testid={`activity-${activity.id}`}>
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
