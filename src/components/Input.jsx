import React from "react";

function Input({
  type,
  label,
  placeholder,
  value,
  cb,
  leftIcon,
  rightIcon,
  options,
  show,
  required,
  defaultValue,
  disabled,
}) {
  return (
    show && (
      <div className="flex flex-col">
        {label && (
          <label className="text-xs font-medium text-stone-500 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        {options ? (
          <div className="inline-flex gap-2 flex-wrap">
            {options?.map((option, index) => {
              const isActive = (option.value ?? option.label) === value;
              return (
                <button
                  key={index}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                  onClick={(e) => {
                    e?.preventDefault();
                    cb((prev) => option.value ?? option.label);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            className={`flex items-center border border-stone-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 bg-white rounded-lg px-3 transition-all ${disabled ? "bg-stone-50" : ""}`}
          >
            {leftIcon && <span className="text-stone-400 mr-2">{leftIcon}</span>}
            {type === "textarea" ? (
              <textarea
                onChange={(e) => {
                  e?.preventDefault();
                  if (cb) cb((prev) => e.target.value);
                }}
                value={value}
                placeholder={placeholder}
                className="py-2.5 w-full bg-transparent text-sm outline-none resize-none placeholder:text-stone-400"
                rows={3}
              />
            ) : (
              <input
                disabled={disabled}
                min={0}
                defaultValue={defaultValue}
                type={type}
                onChange={(e) => {
                  e?.preventDefault();
                  cb((prev) => e.target.value);
                }}
                value={value}
                placeholder={placeholder}
                className="py-2.5 w-full bg-transparent text-sm outline-none placeholder:text-stone-400 disabled:text-stone-400"
              />
            )}
            {rightIcon && <span className="text-stone-400 ml-2">{rightIcon}</span>}
          </div>
        )}
      </div>
    )
  );
}

export default Input;
