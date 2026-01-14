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
            className={`justify-center items-center h-[35px] px-3 gap-2 rounded-[15px] border-2 border-smoke bg-night text-smoke hover:bg-smoke hover:text-night transition-colors ${icon ? "inline-flex" : ""} ${className}`}
            {...props}
        >
            {icon && iconPosition === "left" && icon}
            {children ?? text}
            {icon && iconPosition === "right" && icon}
        </button>
    );
}
