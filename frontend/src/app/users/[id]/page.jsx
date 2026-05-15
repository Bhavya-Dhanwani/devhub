import { PublicUserProfilePage } from "@/features/users/ui/jsx/PublicUserProfilePage";

export const metadata = {
  title: "Writer Profile | DevHub",
  description: "View a DevHub writer profile and published blogs.",
};

export default async function UserProfileRoute({ params }) {
  const { id } = await params;

  return <PublicUserProfilePage userId={id} />;
}
