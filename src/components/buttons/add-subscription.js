"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import BorderButton from "./border-button";

export default function AddSubButton() {
    const router = useRouter();

    return (
        <BorderButton
            text="Add Subscription"
            icon={<Plus size={16} strokeWidth={3} />}
            onClick={() => router.push("/my-subscriptions/add-subscription")}
        />
    );
}