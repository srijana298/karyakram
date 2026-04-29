import React from "react";

const Button = ({ text, type, cb, loading, style }) => {
  return (
    <button
      type={type}
      disabled={loading}
      className={`px-4 py-2.5 text-sm font-semibold text-white text-center rounded-lg bg-primary hover:bg-emerald-600 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20 ${style || "my-4"}`}
      onClick={cb}
    >
      {loading ? "Processing..." : text}
    </button>
  );
};

export default Button;
