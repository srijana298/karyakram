import React from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Input({ type, label, placeholder, value, cb, leftIcon, rightIcon, options, show, required, defaultValue, disabled }) {
  if (!show) return null;
  const change = (event) => cb?.(event.target.value);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="text-xs text-muted-foreground">{label}{required && <span className="ml-0.5 text-destructive">*</span>}</Label>}
      {options ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option, index) => {
            const optionValue = option.value ?? option.label;
            const active = optionValue === value;
            return <Button key={index} type="button" size="sm" variant={active ? "default" : "outline"} onClick={() => cb?.(optionValue)}>{option.label}</Button>;
          })}
        </div>
      ) : (
        <div className="relative flex items-center">
          {leftIcon && <span className="pointer-events-none absolute left-3 z-10 text-muted-foreground">{leftIcon}</span>}
          {type === "textarea" ? (
            <Textarea value={value} onChange={change} placeholder={placeholder} rows={3} className={cn(leftIcon && "pl-9", rightIcon && "pr-9")} />
          ) : (
            <ShadcnInput disabled={disabled} min={0} defaultValue={defaultValue} type={type} value={value} onChange={change} placeholder={placeholder} className={cn(leftIcon && "pl-9", rightIcon && "pr-9")} />
          )}
          {rightIcon && <span className="absolute right-2 z-10 text-muted-foreground">{rightIcon}</span>}
        </div>
      )}
    </div>
  );
}

export default Input;
