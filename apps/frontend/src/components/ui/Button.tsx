import React from 'react';

// define the props for the button
export interface ButtonProps {
    color?: "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "light" | "dark";
    text: string;
    size?: "sm" | "md" | "lg";
    type?: "submit" | "button" | "reset";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string; // Helpful for extra styling overrides
    disabled?: boolean;
}

// create the button component
export const Button = ({
    color = "primary",
    text,
    size = "md",
    type = "button",
    onClick,
    className = "",
    disabled = false
}: ButtonProps) => {
    const colorClasses: Record<NonNullable<ButtonProps["color"]>, string> = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-slate-600 hover:bg-slate-700 text-white",
        danger: "bg-rose-600 hover:bg-rose-700 text-white",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white",
        warning: "bg-amber-500 hover:bg-amber-600 text-white",
        info: "bg-sky-600 hover:bg-sky-700 text-white",
        light: "bg-slate-100 hover:bg-slate-200 text-slate-800",
        dark: "bg-slate-900 hover:bg-slate-950 text-white"
    };

    const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`rounded-lg font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
            disabled={disabled}
        >
            {text}
        </button>
    )
};