import { ChevronDown } from "lucide-react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  pill?: boolean;
};

/** Neumorphic native <select> with a custom chevron (no OS arrow). */
export default function Select({ pill, className = "", children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`field w-full cursor-pointer appearance-none pr-10 text-sm text-ink ${pill ? "rounded-full px-4 py-2.5" : "rounded-xl px-4 py-3"} ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
