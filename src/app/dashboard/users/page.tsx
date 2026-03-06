import { UsersIcon } from "@heroicons/react/24/outline";

export default function UsersPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
            <div className="w-12 h-12 rounded-full bg-[#F4F0FE] dark:bg-purple-900/40 flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-[#7B3FE4] dark:text-purple-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Users</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Platform user management is coming soon.
            </p>
        </div>
    );
}
