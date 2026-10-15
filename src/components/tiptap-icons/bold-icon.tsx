import { memo } from "react";

type Props = React.ComponentPropsWithoutRef<"svg"> & { size?: number };

export const BoldIcon = memo(({ className, size = 16, ...props }: Props) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8Z" />
    </svg>
  );
});

BoldIcon.displayName = "BoldIcon";
