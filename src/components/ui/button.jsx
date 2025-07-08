import * as React from "react";
import { cn } from "../../lib/utils";

const baseStyles =
  "inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 disabled:opacity-60 disabled:pointer-events-none select-none";

const variants = {
  default:
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:brightness-110 active:scale-95 border-0",
  premium:
    "bg-gradient-to-br from-pink-500 via-indigo-500 to-purple-500 text-white shadow-xl shadow-pink-500/20 hover:shadow-pink-400/40 hover:scale-105 active:scale-95 border-0 backdrop-blur-md border border-white/10 rounded-full",
  glass:
    "bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-inner hover:bg-white/20 active:bg-white/30",
  ghost:
    "bg-transparent text-white hover:bg-white/10 active:bg-white/20 border-0",
  icon:
    "rounded-full p-2 bg-white/10 hover:bg-pink-500/20 active:bg-pink-500/30 text-white shadow-md border border-white/10 backdrop-blur-md",
};

const sizes = {
  default: "h-11 px-6 text-base rounded-xl",
  sm: "h-9 px-4 text-sm rounded-lg",
  lg: "h-14 px-8 text-lg rounded-2xl",
  icon: "h-11 w-11 p-0 rounded-full",
};

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant] || variants.default,
          sizes[size] || sizes.default,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
