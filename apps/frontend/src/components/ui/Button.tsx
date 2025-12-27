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
    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn-${color} btn-${size} ${className}`}
            disabled={disabled}
        >
            {text}
        </button>
    )
};