import AdminHeader from "@/components/admin/header";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }) {
    return (
        <>
            <AdminHeader />
            <main className="grid grid-cols-10 items-start min-h-screen p-10 gap-5 text-smoke">
                <AdminSidebar className="col-span-2" />
                <div className="col-span-8 px-5">
                    {children}
                </div>
            </main>
        </>
    );
}