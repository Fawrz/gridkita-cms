import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { requireRole } from "@/lib/auth-mock";

export default async function ClientProfilePage() {
  const me = await requireRole("CLIENT");
  return (
    <>
      <PageHeader title="Profil" description="Kelola informasi akun Anda." />
      <ProfileForm me={me} />
    </>
  );
}
