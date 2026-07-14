import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        button_next: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-xs font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm",
        day_button: "h-9 w-9 rounded-md font-normal hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        today: "[&>button]:bg-muted [&>button]:text-foreground",
        outside: "text-muted-foreground opacity-45",
        disabled: "text-muted-foreground opacity-35",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClass }) => orientation === "left"
          ? <ChevronLeftIcon className={cn("h-4 w-4", iconClass)} />
          : <ChevronRightIcon className={cn("h-4 w-4", iconClass)} />,
      }}
      {...props}
    />
  )
}

export { Calendar }
