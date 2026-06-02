import React from "react";
import { Loader2 } from "lucide-react";

const TxButton = ({
  onClick,
  loading = false,
  disabled = false,
  children,
  variant = "primary",
  size = "",
  className = "",
  type = "button",
  icon: Icon,
}) => {
  const variantClass = {
    primary:   "btn-primary",
    secondary: "btn-secondary",
    danger:    "btn-danger",
    success:   "btn-success",
  }[variant] || "btn-primary";

  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
};

export default TxButton;
