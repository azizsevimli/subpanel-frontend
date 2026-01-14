import Sidebar from "@/components/sidebar";

export default function LoggedInLayout({ children }) {
    return (
        <>
            <main className="grid grid-cols-1 md:grid-cols-10 items-start min-h-screen px-5 py-10 lg:p-10 gap-10 md:gap-5 text-smoke">
                <Sidebar className="md:col-span-3 lg:col-span-2" />
                <div className="md:col-span-7 lg:col-span-8 md:px-5">
                    {children}
                </div>
            </main>
        </>
    );
}
