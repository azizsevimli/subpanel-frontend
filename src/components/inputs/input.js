export default function FormInput({ type = "text", placeholder = "", className = "", ...props }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className={`w-full h-[35px] pl-3 rounded-[15px] outline-none border border-jet bg-smoke text-night ${className}`}
            {...props}
        />
    );
}