import { Link, useLocation } from "wouter";
import { BarChart3, Users, FileBox, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminNavProps {
  onLogout: () => void;
}

const navItems = [
  { path: "/admin/stats", label: "上传统计", icon: BarChart3 },
  { path: "/admin/users", label: "用户管理", icon: Users },
  { path: "/admin/files", label: "文件管理", icon: FileBox },
];

export default function AdminNav({ onLogout }: AdminNavProps) {
  const [location] = useLocation();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <Link href="/">
            <span className="text-sm font-bold text-slate-700 mr-3 cursor-pointer hover:text-blue-600 transition-colors">
              CORITON 后台
            </span>
          </Link>
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`gap-1.5 ${isActive ? "" : "text-muted-foreground"}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          退出
        </Button>
      </div>
    </header>
  );
}
