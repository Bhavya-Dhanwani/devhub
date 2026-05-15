import { BlogComposerPage } from "@/features/blogs/ui/jsx/BlogComposerPage";

export default async function EditBlogPage({ params }) {
  const { id } = await params;

  return <BlogComposerPage blogId={id} />;
}
