import { BlogDetailPage } from "@/features/blogs/ui/jsx/BlogDetailPage";

export default async function BlogPage({ params }) {
  const { slug } = await params;

  return <BlogDetailPage slug={slug} />;
}
