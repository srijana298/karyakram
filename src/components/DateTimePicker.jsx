import * as React from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DateTimePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  required = false,
  error,
}) {
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    () => value && dayjs(value).isValid() ? new Date(value) : undefined,
    [value],
  );
  const time = selected ? dayjs(selected).format("HH:mm") : "";

  const emit = (date, nextTime = time || "12:00") => {
    if (!date) return;
    onChange?.(`${dayjs(date).format("YYYY-MM-DD")}T${nextTime}`);
  };

  const disabled = [
    { before: minDate ? dayjs(minDate).startOf("day").toDate() : dayjs().startOf("day").toDate() },
    ...(maxDate ? [{ after: dayjs(maxDate).endOf("day").toDate() }] : []),
  ];

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}{required && <span className="ml-0.5 text-destructive">*</span>}
        </div>
      )}
      <FieldGroup className="flex-row gap-2">
        <Field className="min-w-0 flex-1 gap-1.5">
          <FieldLabel htmlFor={`date-picker-${label || placeholder}`} className="sr-only">Date</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id={`date-picker-${label || placeholder}`}
                  className="h-11 w-full justify-between px-3 font-normal"
                >
                  <span className={selected ? "truncate" : "truncate text-muted-foreground"}>
                    {selected ? format(selected, "PPP") : placeholder}
                  </span>
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              }
            />
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={selected}
                defaultMonth={selected || (minDate ? new Date(minDate) : new Date())}
                disabled={disabled}
                onSelect={(date) => {
                  if (!date) return;
                  emit(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field className="w-32 shrink-0 gap-1.5">
          <FieldLabel htmlFor={`time-picker-${label || placeholder}`} className="sr-only">Time</FieldLabel>
          <Input
            type="time"
            id={`time-picker-${label || placeholder}`}
            step="60"
            value={time}
            onChange={(event) => emit(selected || new Date(), event.target.value)}
            className="h-11 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </Field>
      </FieldGroup>
      {error && <FieldError className="mt-1 text-xs">{error}</FieldError>}
    </div>
  );
}
