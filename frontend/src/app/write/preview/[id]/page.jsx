import { BlogDetailPage } from "@/features/blogs/ui/jsx/BlogDetailPage";

export default async function BlogPreviewPage({ params }) {
  const { id } = await params;

  return <BlogDetailPage backHref="/write" identifier={id} preview />;
}
