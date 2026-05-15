"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookText, Eye, MessageCircle } from "lucide-react";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useBlogDetail } from "../../hooks/useBlogDetail";
import styles from "../css/BlogDetail.module.css";

export function BlogDetailPage({ backHref = "/", identifier, preview = false, slug }) {
  const router = useRouter();
  const { blog, error, isLoading } = useBlogDetail(identifier || slug, { preview });
  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  };

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <article className={styles.content}>
        <button className={styles.backLink} type="button" onClick={goBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        {isLoading ? (
          <section className={styles.state} role="status">
            <BookText size={28} />
            <p>Loading blog...</p>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className={styles.state} role="alert">
            <BookText size={28} />
            <p>{error}</p>
          </section>
        ) : null}

        {!isLoading && !error && blog ? (
          <>
            {blog.coverImage?.url ? (
              <div className={styles.cover}>
                <Image src={blog.coverImage.url} alt="" fill unoptimized />
              </div>
            ) : null}

            <header className={styles.header}>
              <div className={styles.meta}>
                {preview && blog.status === "draft" ? <span>draft preview</span> : null}
                <span>{blog.category}</span>
                <span>{blog.readTime || 1} min read</span>
              </div>
              <h1>{blog.title}</h1>
              <p>{blog.subheading}</p>
              <div className={styles.author}>
                <strong>{blog.author?.name || "DevHub writer"}</strong>
                <span>
                  <Eye size={14} />
                  {blog.views || 0}
                </span>
                <span>
                  <MessageCircle size={14} />
                  {blog.commentsCount || 0}
                </span>
              </div>
            </header>

            <div className={styles.body}>
              {renderBlogContent(blog.content)}
            </div>
          </>
        ) : null}
      </article>
    </main>
  );
}

function renderBlogContent(content) {
  const normalizedContent = String(content || "")
    .replace(/\r\n/g, "\n")
    .replace(/!\[([^\]]*)\]\s*\n+\s*\(([^)]+)\)/g, "![$1]($2)");
  const imagePattern = /!\[([^\]]*)\]\s*\(([^)]+)\)/gi;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = imagePattern.exec(normalizedContent))) {
    pushMarkdownBlocks(nodes, normalizedContent.slice(lastIndex, match.index));
    nodes.push({
      alt: match[1] || "Blog image",
      src: match[2],
      type: "image",
    });
    lastIndex = imagePattern.lastIndex;
  }

  pushMarkdownBlocks(nodes, normalizedContent.slice(lastIndex));

  return nodes.map((node, index) => {
    if (node.type === "image") {
      return (
        <figure className={styles.contentImage} key={`${index}-${node.alt}`}>
          <img src={node.src} alt={node.alt} />
        </figure>
      );
    }

    if (node.type === "code") {
      return (
        <pre className={styles.codeBlock} key={`${index}-${node.language}`}>
          <code>{node.text}</code>
        </pre>
      );
    }

    if (node.type === "heading") {
      const HeadingTag = `h${node.level}`;
      return <HeadingTag key={`${index}-${node.text.slice(0, 24)}`}>{node.text}</HeadingTag>;
    }

    if (node.type === "quote") {
      return <blockquote key={`${index}-${node.text.slice(0, 24)}`}>{node.text}</blockquote>;
    }

    if (node.type === "list") {
      return (
        <ul key={`${index}-${node.items.join("-").slice(0, 24)}`}>
          {node.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    return <p key={`${index}-${node.text.slice(0, 24)}`}>{node.text}</p>;
  });
}

function pushMarkdownBlocks(nodes, text) {
  const lines = String(text || "").split("\n");
  let paragraphLines = [];
  let listItems = [];
  let quoteLines = [];
  let codeLines = [];
  let codeLanguage = "";
  let isReadingCode = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    nodes.push({ text: paragraphLines.join("\n").trim(), type: "text" });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    nodes.push({ items: listItems, type: "list" });
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }

    nodes.push({ text: quoteLines.join("\n").trim(), type: "quote" });
    quoteLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmedLine = line.trim();
    const codeStart = trimmedLine.match(/^```(\w+)?$/);

    if (isReadingCode) {
      if (trimmedLine === "```") {
        nodes.push({
          language: codeLanguage,
          text: codeLines.join("\n"),
          type: "code",
        });
        codeLanguage = "";
        codeLines = [];
        isReadingCode = false;
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    if (codeStart) {
      flushParagraph();
      flushList();
      flushQuote();
      codeLanguage = codeStart[1] || "";
      isReadingCode = true;
      continue;
    }

    if (!trimmedLine) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const heading = trimmedLine.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      nodes.push({
        level: heading[1].length + 1,
        text: heading[2],
        type: "heading",
      });
      continue;
    }

    const listItem = trimmedLine.match(/^[-*]\s+(.+)$/);

    if (listItem) {
      flushParagraph();
      flushQuote();
      listItems.push(listItem[1]);
      continue;
    }

    const quote = trimmedLine.match(/^>\s?(.+)$/);

    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(line);
  }

  if (isReadingCode) {
    nodes.push({
      language: codeLanguage,
      text: codeLines.join("\n"),
      type: "code",
    });
  }

  flushParagraph();
  flushList();
  flushQuote();
}
