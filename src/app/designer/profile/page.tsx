import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { requireRole } from "@/lib/auth-mock";

export default async function DesignerProfilePage() {
  const me = await requireRole("DESIGNER");
  return (
    <>
      <PageHeader
        title="Profil Desainer"
        description="Termasuk informasi rekening untuk pencairan komisi."
      />
      <ProfileForm me={me} showBank />
    </>
  );
}
