"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IdentificationIcon,
    ShoppingCartIcon,
    Cog6ToothIcon,
    BuildingOffice2Icon,
    UsersIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { useUser } from "@/context/user-context";
import { SignoutButton } from "./signout-button";
import { ThemeToggle } from "./theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const NAV_SECTIONS = [
    {
        title: "RESIDENTS",
        links: [
            { href: "/dashboard/residents", label: "Residents", icon: IdentificationIcon },
            { href: "/dashboard/transactions", label: "Transactions", icon: ShoppingCartIcon },
        ],
    },
    {
        title: "PLATFORM",
        links: [
            { href: "/dashboard/configuration", label: "Configuration", icon: Cog6ToothIcon },
            { href: "/dashboard/units", label: "Units", icon: BuildingOffice2Icon },
            { href: "/dashboard/users", label: "Users", icon: UsersIcon },
        ],
    },
];

export function DesktopNav() {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside className="fixed top-0 left-0 hidden h-screen w-[220px] bg-[#160533] sm:flex sm:flex-col z-40">
            {/* User / Company Header */}
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 px-5 py-5 focus:outline-none hover:bg-white/5 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-[#5B21B6] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {user?.initials ?? "MS"}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight truncate">
                            {user?.companyName ?? "Stairpay"}
                        </p>
                        <p className="text-white/50 text-xs truncate">{user?.name ?? ""}</p>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="ml-2 min-w-40">
                    <SignoutButton />
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <div className="px-4 pb-5">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <MagnifyingGlassIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-white text-sm placeholder-white/40 flex-1 outline-none w-full"
                    />
                    <kbd className="bg-white/10 text-white/40 text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                        /
                    </kbd>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-5 overflow-y-auto min-h-0">
                {NAV_SECTIONS.map(({ title, links }) => (
                    <div key={title}>
                        <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
                            {title}
                        </p>
                        <div className="space-y-0.5">
                            {links.map(({ href, label, icon: Icon }) => {
                                const active =
                                    pathname === href || pathname.startsWith(href + "/");
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={[
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            active
                                                ? "bg-white/15 text-white"
                                                : "text-white/60 hover:bg-white/10 hover:text-white",
                                        ].join(" ")}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            {/* Theme toggle — pinned to bottom */}
            <div className="px-3 pb-4 pt-2 border-t border-white/10 flex-shrink-0">
                <ThemeToggle />
            </div>
        </aside>
    );
}
