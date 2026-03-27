import Link from "next/link";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  badge?: string;
}

export default function ModuleCard({
  title,
  description,
  icon,
  href,
  gradient,
  badge,
}: ModuleCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`}
        />
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 ${gradient} bg-opacity-10`}
        >
          {icon}
        </div>
        {badge && (
          <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
            {badge}
          </span>
        )}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
        <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
          Launch module
          <svg
            className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
