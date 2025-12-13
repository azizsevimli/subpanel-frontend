export default function Button({
    text = "",
    icon = null,
    iconPosition = "left",
    className = "",
    children,
    ...props
}) {
    return (
        <button
            className={`h-[35px] px-3 rounded-[15px] border-2 border-smoke bg-smoke text-night hover:bg-eerie hover:text-smoke hover:border-2 hover:border-smoke transition-colors ${icon ? "inline-flex" : ""} items-center gap-2 ${className}`}
            {...props}
        >
            {icon && iconPosition === "left" && icon}
            {children ?? text}
            {icon && iconPosition === "right" && icon}
        </button>
    );
}