"use client"

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ placeholder = "password", ...props }) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative w-full">
            <span
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-night"
            >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>

            <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                className="w-full h-[35px] pl-3 rounded-[15px] outline-none border border-jet bg-white text-night"
                {...props}
            />
        </div>
    );
}
