import { BlogDetailPage } from "@/features/blogs/ui/jsx/BlogDetailPage";

export default async function BlogPreviewPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;

  return <BlogDetailPage backHref={getBackHref(query?.from)} identifier={id} preview />;
}

function getBackHref(value) {
  const from = Array.isArray(value) ? value[0] : value;
  const allowedBackHrefs = new Set(["/dashboard", "/write"]);

  return allowedBackHrefs.has(from) ? from : "/write";
}
