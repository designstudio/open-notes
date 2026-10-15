import { memo } from "react";

type Props = React.ComponentPropsWithoutRef<"svg"> & { size?: number };

export const CodeIcon = memo(({ className, size = 16, ...props }: Props) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
});

CodeIcon.displayName = "CodeIcon";
