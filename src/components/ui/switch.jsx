import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn("group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors outline-none data-[checked]:bg-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform group-data-[checked]:translate-x-5 dark:bg-foreground dark:group-data-[checked]:bg-primary-foreground" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
