import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BackSubscriptionButton({ className }) {
    return (
        <Link
            href="/my-subscriptions"
            className={`inline-flex items-center gap-2 text-silver hover:text-smoke ${className}`}
        >
            <ArrowLeft size={18} />
            <p>Back to My Subscriptions</p>
        </Link>
    );
}
