interface HeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <i className="fas fa-bars"></i>
          </button>
          <nav className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Super Admin</span>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-foreground font-medium">Dashboard</span>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="search" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
              data-testid="input-search"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
          </div>
          
          <button 
            className="p-2 rounded-md hover:bg-muted relative"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user?.firstName ? user.firstName[0] : 'U'}
                {user?.lastName ? user.lastName[0] : 'U'}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium" data-testid="text-username">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </p>
              <p className="text-xs text-muted-foreground">wytnet.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
