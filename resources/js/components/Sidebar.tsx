import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Building,
    ClipboardList,
    CheckSquare,
    LogOut,
    Shield,
    Key,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

const Sidebar: React.FC = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    interface NavItem {
        name: string;
        path: string;
        icon: React.ElementType;
        permission?: string;
    }

    interface NavGroup {
        group: string;
        items: NavItem[];
    }

    const groupedNavItems: NavGroup[] = [
        {
            group: "Main",
            items: [{ name: "Dashboard", path: "/", icon: LayoutDashboard }],
        },
        {
            group: "Leave Management",
            items: [
                {
                    name: "My Leaves",
                    path: "/leaves",
                    icon: ClipboardList,
                    permission: "view_own_leaves",
                },
                {
                    name: "Approvals",
                    path: "/leaves/approvals",
                    icon: CheckSquare,
                    permission: "approve_leaves",
                },
            ],
        },
        {
            group: "Master Data",
            items: [
                {
                    name: "Departments",
                    path: "/departments",
                    icon: Building,
                    permission: "view_departments",
                },
                {
                    name: "Employees",
                    path: "/employees",
                    icon: Users,
                    permission: "view_users", // Using view_users permission for now as it makes sense
                },
                {
                    name: "Users (Account)",
                    path: "/users",
                    icon: Key,
                    permission: "view_users",
                },
                {
                    name: "Roles",
                    path: "/roles",
                    icon: Shield,
                    permission: "view_roles",
                },
                {
                    name: "Permissions",
                    path: "/permissions",
                    icon: ClipboardList, // Changed icon to avoid duplicate
                    permission: "view_permissions",
                },
            ],
        },
    ];

    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        return user?.permissions?.includes(permission);
    };

    return (
        <div className="flex flex-col w-64 bg-gray-900 text-white min-h-screen">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <h1 className="text-xl font-bold">Leave System</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-6">
                    {groupedNavItems.map((group, groupIdx) => {
                        const filteredItems = group.items.filter((item) =>
                            hasPermission(item.permission),
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={groupIdx}>
                                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    {group.group}
                                </h3>
                                <div className="space-y-1">
                                    {filteredItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.path;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                className={clsx(
                                                    isActive
                                                        ? "bg-gray-800 text-white"
                                                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md ml-2",
                                                )}
                                            >
                                                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center mb-4">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                            {user?.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                            {user?.role}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
