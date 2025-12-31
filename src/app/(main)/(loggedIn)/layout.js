import Sidebar from "@/components/sidebar";

export default function LoggedInLayout({ children }) {
    return (
        <>
            <main className="grid grid-cols-10 items-start min-h-screen p-10 gap-5 text-smoke">
                <Sidebar className="col-span-2" />
                <div className="col-span-8 px-5">
                    {children}
                </div>
            </main>
        </>
    );
}
