import AdminLayout from "@/components/admin/AdminLayout";
import { getSessionUser } from "@/lib/session";
import { notFound } from "next/navigation";

export const metadata = {
    title: "GoCart. - Admin",
    description: "GoCart. - Admin",
};

export default async function RootAdminLayout({ children }) {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
        notFound();
    }

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
