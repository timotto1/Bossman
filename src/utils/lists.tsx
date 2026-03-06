import {
    IdentificationIcon,
    ShoppingCartIcon,
    Cog6ToothIcon,
    BuildingOffice2Icon,
    UsersIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export const navSections = [
    {
        title: "Residents",
        permissions: [],
        items: [
            {
                href: "/dashboard/residents",
                label: "Residents",
                icon: IdentificationIcon,
                permissions: [],
            },
            {
                href: "/dashboard/transactions",
                label: "Transactions",
                icon: ShoppingCartIcon,
                permissions: [],
            },
        ],
    },
    {
        title: "Platform",
        permissions: [],
        items: [
            {
                href: "/dashboard/configuration",
                label: "Configuration",
                icon: Cog6ToothIcon,
                permissions: [],
            },
            {
                href: "/dashboard/units",
                label: "Units",
                icon: BuildingOffice2Icon,
                permissions: [],
            },
            {
                href: "/dashboard/users",
                label: "Users",
                icon: UsersIcon,
                permissions: [],
            },
        ],
    },
];

export const helpItem = {
    href: "/dashboard/help",
    label: "Help",
    icon: QuestionMarkCircleIcon,
};
