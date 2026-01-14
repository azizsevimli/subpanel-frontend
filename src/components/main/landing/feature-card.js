export default function FeatureCard({ title, text }) {
    return (
        <div className="rounded-3xl border border-jet p-6 space-y-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-silver">{text}</p>
        </div>
    );
}
