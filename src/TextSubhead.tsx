import type { SVGProps } from 'react';

export function TextSubhead({ size = 20, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 20 20" aria-hidden="true" focusable="false" {...props}>
    <path fill="currentColor" d="M18 17H2v-1.5h16zM18 13H2v-1.5h16zM8.5 3.75H6v5.5H4.5v-5.5H2v-1.5h6.5zM18 8.75H9v-1.5h9z" />
  </svg>;
}
