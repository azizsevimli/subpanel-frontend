export default function ReqOptLabel({ children, required = false, optional = false }) {
    return (
        <p className="ml-2 text-sm text-silver">
            {children}{" "}
            {required ? <span className="text-wrong">*</span> : null}
            {optional ? <span className="text-info"> (optional)</span> : null}
        </p>
    );
}
