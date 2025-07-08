import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;

const SheetContent = React.forwardRef(({ className, side = "right", children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-black/90 border border-white/10 shadow-xl backdrop-blur-md",
        "transition-all duration-300 ease-in-out",
        side === "bottom"
          ? "left-0 right-0 bottom-0 rounded-t-2xl w-full max-h-[90vh]"
          : "top-0 bottom-0 right-0 w-80 md:w-96 rounded-l-2xl",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent }; 