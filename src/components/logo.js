export default function Logo({ admin = false }) {
    return (
        <div className="text-center">
            <h1 className="text-3xl tracking-wide">
                <span className="font-bold">
                    Sub
                </span>
                <span className="font-light underline underline-offset-2">
                    Panel
                </span>
                {admin && <span className="font-light"> Admin</span>}
            </h1>
        </div>
    );
}