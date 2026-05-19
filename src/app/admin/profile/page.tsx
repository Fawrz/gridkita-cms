import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { requireRole } from "@/lib/auth-mock";

export default async function AdminProfilePage() {
  const me = await requireRole("ADMIN");
  return (
    <>
      <PageHeader title="Profil Admin" description="Kelola informasi akun admin." />
      <ProfileForm me={me} />
    </>
  );
}
