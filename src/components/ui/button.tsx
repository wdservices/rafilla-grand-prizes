import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-extrabold transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-coral text-paper shadow-[0_8px_20px_-8px_var(--coral)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_var(--coral)]",
        dark: "bg-ink text-cream shadow-[0_14px_30px_-10px_var(--ink)] hover:-translate-y-0.5",
        outline: "border border-ink/15 bg-paper text-ink hover:bg-lilac/15",
        ghost: "text-ink/65 hover:bg-paper hover:text-ink",
      },
      size: {
        sm: "h-9 rounded-full px-3.5 text-xs",
        md: "min-h-11 rounded-full px-5 text-sm",
        lg: "min-h-12 rounded-full px-6 text-sm",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };