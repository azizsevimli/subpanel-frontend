export default function BorderButton({
    text = "",
    icon = null,
    iconPosition = "left",
    className = "",
    children,
    ...props
}) {
    return (
        <button
            className={`h-[35px] px-3 rounded-[15px] border-2 border-smoke bg-night text-smoke hover:bg-smoke hover:text-night transition-colors ${icon ? "inline-flex" : ""} items-center gap-2 ${className}`}
            {...props}
        >
            {icon && iconPosition === "left" && icon}
            {children ?? text}
            {icon && iconPosition === "right" && icon}
        </button>
    );
}
