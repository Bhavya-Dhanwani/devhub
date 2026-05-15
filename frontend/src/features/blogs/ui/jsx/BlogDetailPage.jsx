"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, BookText, Eye, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "@/features/auth/state/authSlice";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { blogsApi, projectsApi } from "../../api/blogs.api";
import { useBlogDetail } from "../../hooks/useBlogDetail";
import { BookmarkButton } from "./BookmarkButton";
import styles from "../css/BlogDetail.module.css";

export function BlogDetailPage({ backHref = "/", contentType = "blog", identifier, preview = false, slug }) {
  const router = useRouter();
  const contentApi = contentType === "project" ? projectsApi : blogsApi;
  const { status, user } = useAppSelector(selectAuth);
  const { blog, error, isLoading } = useBlogDetail(identifier || slug, { contentType, preview });
  const [comments, setComments] = useState([]);
  const [commentsError, setCommentsError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentsCount, setCommentsCount] = useState(0);
  const [activeReplyId, setActiveReplyId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSaving, setIsCommentSaving] = useState(false);
  const [isReplySaving, setIsReplySaving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeSaving, setIsLikeSaving] = useState(false);
  const [savingCommentLikeId, setSavingCommentLikeId] = useState("");

  useEffect(() => {
    if (!blog?._id) {
      return;
    }

    setLikesCount(blog.likesCount || 0);
    setIsLiked(Boolean(blog.isLiked));
    setCommentsCount(blog.commentsCount || 0);
  }, [blog?._id, blog?.commentsCount, blog?.isLiked, blog?.likesCount]);

  useEffect(() => {
    if (!blog?._id || preview) {
      return;
    }

    let isMounted = true;

    async function loadComments() {
      setIsCommentsLoading(true);
      setCommentsError("");

      try {
          const payload = await contentApi.getComments(blog._id, { limit: 20 });

        if (isMounted) {
          setComments(payload.comments || []);
        }
      } catch (loadError) {
        if (isMounted) {
          setCommentsError("Could not load comments.");
        }
      } finally {
        if (isMounted) {
          setIsCommentsLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [blog?._id, contentApi, preview]);

  const goBack = () => {
    if (backHref && backHref !== "/") {
      router.push(backHref);
      return;
    }

    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === "number" && historyIndex > 0) {
      window.history.back();
      return;
    }

    router.push(backHref);
  };

  const toggleLike = async () => {
    if (!blog?._id || isLikeSaving) {
      return;
    }

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    const nextLiked = !isLiked;
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(nextLiked);
    setLikesCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    setIsLikeSaving(true);

    try {
      const payload = await contentApi.updateLike(blog._id, nextLiked);
      setLikesCount(payload.likesCount || 0);
      setIsLiked(Boolean(payload.isLiked));
    } catch (likeError) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error("Could not update like.");
    } finally {
      setIsLikeSaving(false);
    }
  };

  const shareBlog = async () => {
    const shareUrl = window.location.href;
    const sharePayload = {
      title: blog?.title || "DevHub blog",
      text: blog?.subheading || "Read this blog on DevHub.",
      url: shareUrl,
    };

    try {
      if (window.navigator.share) {
        await window.navigator.share(sharePayload);
        return;
      }

      await window.navigator.clipboard.writeText(shareUrl);
      toast.success("Blog link copied.");
    } catch (shareError) {
      if (shareError?.name !== "AbortError") {
        toast.error("Could not share this blog.");
      }
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();

    if (!blog?._id || isCommentSaving) {
      return;
    }

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    const body = commentText.trim();

    if (!body) {
      return;
    }

    setIsCommentSaving(true);

    try {
      const comment = await contentApi.createComment(blog._id, { body });
      setComments((current) => [comment, ...current]);
      setCommentsCount((current) => current + 1);
      setCommentText("");
    } catch (commentError) {
      toast.error("Could not post comment.");
    } finally {
      setIsCommentSaving(false);
    }
  };

  const submitReply = async (event, parentCommentId) => {
    event.preventDefault();

    if (!blog?._id || isReplySaving) {
      return;
    }

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    const body = replyText.trim();

    if (!body) {
      return;
    }

    setIsReplySaving(true);

    try {
      const reply = await contentApi.createComment(blog._id, { body, parentCommentId });
      setComments((current) => insertReplyIntoThread(current, parentCommentId, reply));
      setCommentsCount((current) => current + 1);
      setActiveReplyId("");
      setReplyText("");
    } catch (replyError) {
      toast.error("Could not post reply.");
    } finally {
      setIsReplySaving(false);
    }
  };

  const toggleCommentLike = async (comment) => {
    if (!blog?._id || savingCommentLikeId) {
      return;
    }

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    const nextLiked = !comment.isLiked;
    const previousComments = comments;

    setSavingCommentLikeId(comment._id);
    setComments((current) => updateCommentInThread(current, comment._id, {
      isLiked: nextLiked,
      likesCount: Math.max(0, (comment.likesCount || 0) + (nextLiked ? 1 : -1)),
    }));

    try {
      const payload = await contentApi.updateCommentLike(blog._id, comment._id, nextLiked);
      setComments((current) => updateCommentInThread(current, comment._id, {
        isLiked: Boolean(payload.isLiked),
        likesCount: payload.likesCount || 0,
      }));
    } catch (commentLikeError) {
      setComments(previousComments);
      toast.error("Could not update comment like.");
    } finally {
      setSavingCommentLikeId("");
    }
  };

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <article className={styles.content}>
        <div className={styles.topActions}>
          <button className={styles.backLink} type="button" onClick={goBack}>
            <ArrowLeft size={17} />
            Back
          </button>
          {!preview && !isLoading && !error && blog ? (
            <button className={styles.shareButton} type="button" onClick={shareBlog}>
              <Share2 size={16} />
              Share
            </button>
          ) : null}
        </div>

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
                <span>{formatRelativeDate(blog.createdAt)}</span>
              </div>
              <h1>{blog.title}</h1>
              <p>{blog.subheading}</p>
              <div className={styles.author}>
                {blog.author?._id ? (
                  <Link className={styles.authorLink} href={`/users/${blog.author._id}`}>
                    {blog.author?.name || "DevHub writer"}
                  </Link>
                ) : (
                  <strong>{blog.author?.name || "DevHub writer"}</strong>
                )}
                <span>
                  <Eye size={14} />
                  {blog.views || 0}
                </span>
                <span>
                  <MessageCircle size={14} />
                  {commentsCount}
                </span>
                {!preview ? (
                  <>
                    <button
                      className={`${styles.likeButton} ${isLiked ? styles.likeButtonActive : ""}`}
                      type="button"
                      disabled={isLikeSaving}
                      aria-pressed={isLiked}
                      onClick={toggleLike}
                    >
                      <Heart size={16} />
                      {likesCount}
                    </button>
                    <BookmarkButton blog={blog} className={styles.detailSaveButton} contentType={contentType} />
                  </>
                ) : null}
              </div>
            </header>

            <div className={styles.body}>
              {renderBlogContent(blog.content)}
            </div>

            {!preview ? (
              <section className={styles.commentsSection}>
                <div className={styles.commentsHeader}>
                  <div>
                    <h2>Discussion</h2>
                    <p>{commentsCount ? "Share context, questions, and follow-up ideas." : "Start the conversation."}</p>
                  </div>
                  <span>{commentsCount}</span>
                </div>

                <form className={styles.commentForm} onSubmit={submitComment}>
                  <div className={styles.composerAvatar}>
                    {user?.avatar ? (
                      <Image src={user.avatar} alt="" fill unoptimized />
                    ) : (
                      <span>{(user?.name || "D").slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className={styles.composerPanel}>
                    <textarea
                      maxLength={1000}
                      placeholder={status === "authenticated" ? "Join the discussion..." : "Sign in to comment"}
                      rows={3}
                      value={commentText}
                      disabled={isCommentSaving}
                      onChange={(event) => setCommentText(event.target.value)}
                    />
                    <div className={styles.composerActions}>
                      <span>{commentText.length}/1000</span>
                      <button disabled={isCommentSaving || !commentText.trim()} type="submit">
                        <Send size={15} />
                        {isCommentSaving ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </div>
                </form>

                {isCommentsLoading ? (
                  <div className={styles.commentSkeletonList} aria-label="Loading comments">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div className={styles.commentSkeleton} key={index}>
                        <span />
                        <div>
                          <i />
                          <b />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {!isCommentsLoading && commentsError ? (
                  <p className={styles.commentState}>{commentsError}</p>
                ) : null}
                {!isCommentsLoading && !commentsError && comments.length ? (
                  <div className={styles.commentList}>
                    {comments.map((comment) => (
                      <CommentThread
                        activeReplyId={activeReplyId}
                        comment={comment}
                        isReplySaving={isReplySaving}
                        key={comment._id}
                        replyText={replyText}
                        savingCommentLikeId={savingCommentLikeId}
                        status={status}
                        onCancelReply={() => {
                          setActiveReplyId("");
                          setReplyText("");
                        }}
                        onChangeReply={setReplyText}
                        onReplyClick={(commentId) => {
                          setActiveReplyId(commentId);
                          setReplyText("");
                        }}
                        onToggleLike={toggleCommentLike}
                        onSubmitReply={submitReply}
                      />
                    ))}
                  </div>
                ) : null}
                {!isCommentsLoading && !commentsError && !comments.length ? (
                  <div className={styles.emptyComments}>
                    <MessageCircle size={22} />
                    <strong>No comments yet</strong>
                    <p>Be the first to add a useful thought.</p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
      </article>
    </main>
  );
}

function CommentThread({
  activeReplyId,
  comment,
  isReplySaving,
  replyText,
  savingCommentLikeId,
  status,
  onCancelReply,
  onChangeReply,
  onReplyClick,
  onToggleLike,
  onSubmitReply,
}) {
  const canReplyDeeper = (comment.depth || 0) < 3;
  const isCommentLikeSaving = savingCommentLikeId === comment._id;

  return (
    <article className={styles.commentThread}>
      <div className={styles.commentCard}>
        <div className={styles.commentAvatar}>
          {comment.author?.avatar ? (
            <Image src={comment.author.avatar} alt="" fill unoptimized />
          ) : (
            <span>{(comment.author?.name || "D").slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className={styles.commentMeta}>
            <strong>{comment.author?.name || "DevHub writer"}</strong>
            {comment.author?.username ? <em>@{comment.author.username}</em> : null}
            <span>{formatRelativeDate(comment.createdAt)}</span>
          </p>
          <p className={styles.commentBody}>{comment.body}</p>
          <div className={styles.commentActions}>
            <button
              className={`${styles.commentLikeButton} ${comment.isLiked ? styles.commentLikeButtonActive : ""}`}
              type="button"
              disabled={isCommentLikeSaving}
              aria-pressed={Boolean(comment.isLiked)}
              onClick={() => onToggleLike(comment)}
            >
              <Heart size={14} />
              {comment.likesCount || 0}
            </button>
            {canReplyDeeper ? (
              <button className={styles.replyButton} type="button" onClick={() => onReplyClick(comment._id)}>
                Reply
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {activeReplyId === comment._id ? (
        <form className={styles.replyForm} onSubmit={(event) => onSubmitReply(event, comment._id)}>
          <textarea
            maxLength={1000}
            placeholder={status === "authenticated" ? "Write a reply..." : "Sign in to reply"}
            rows={2}
            value={replyText}
            disabled={isReplySaving}
            onChange={(event) => onChangeReply(event.target.value)}
          />
          <div>
            <span>{replyText.length}/1000</span>
            <button disabled={isReplySaving} type="button" onClick={onCancelReply}>
              Cancel
            </button>
            <button disabled={isReplySaving || !replyText.trim()} type="submit">
              {isReplySaving ? "Replying..." : "Reply"}
            </button>
          </div>
        </form>
      ) : null}

      {comment.replies?.length ? (
        <div className={styles.replyList}>
          {comment.replies.map((reply) => (
            <CommentThread
              activeReplyId={activeReplyId}
              comment={reply}
              isReplySaving={isReplySaving}
              key={reply._id}
              replyText={replyText}
              savingCommentLikeId={savingCommentLikeId}
              status={status}
              onCancelReply={onCancelReply}
              onChangeReply={onChangeReply}
              onReplyClick={onReplyClick}
              onToggleLike={onToggleLike}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function updateCommentInThread(comments, commentId, updates) {
  return comments.map((comment) => {
    if (String(comment._id) === String(commentId)) {
      return {
        ...comment,
        ...updates,
      };
    }

    return {
      ...comment,
      replies: comment.replies?.length
        ? updateCommentInThread(comment.replies, commentId, updates)
        : comment.replies || [],
    };
  });
}

function insertReplyIntoThread(comments, parentCommentId, reply) {
  return comments.map((comment) => {
    if (String(comment._id) === String(parentCommentId)) {
      return {
        ...comment,
        replies: [reply, ...(comment.replies || [])],
        repliesCount: (comment.repliesCount || 0) + 1,
      };
    }

    return {
      ...comment,
      replies: comment.replies?.length
        ? insertReplyIntoThread(comment.replies, parentCommentId, reply)
        : comment.replies || [],
    };
  });
}

function formatRelativeDate(value) {
  if (!value) {
    return "just now";
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
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
      return <HeadingTag key={`${index}-${node.text.slice(0, 24)}`}>{renderInlineMarkdown(node.text)}</HeadingTag>;
    }

    if (node.type === "quote") {
      return <blockquote key={`${index}-${node.text.slice(0, 24)}`}>{renderInlineMarkdown(node.text)}</blockquote>;
    }

    if (node.type === "list") {
      return (
        <ul key={`${index}-${node.items.join("-").slice(0, 24)}`}>
          {node.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    }

    return <p key={`${index}-${node.text.slice(0, 24)}`}>{renderInlineMarkdown(node.text)}</p>;
  });
}

function renderInlineMarkdown(text) {
  const safeText = String(text || "");
  const linkPattern = /\[([^\]]+)]\(([^)\s]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(safeText))) {
    if (match.index > lastIndex) {
      parts.push(safeText.slice(lastIndex, match.index));
    }

    const href = normalizeMarkdownHref(match[2]);

    parts.push(
      href ? (
        <a href={href} key={`${match[1]}-${match.index}`} rel="noreferrer" target="_blank">
          {match[1]}
        </a>
      ) : match[1],
    );
    lastIndex = linkPattern.lastIndex;
  }

  if (lastIndex < safeText.length) {
    parts.push(safeText.slice(lastIndex));
  }

  return parts.length ? parts : safeText;
}

function normalizeMarkdownHref(value) {
  const href = String(value || "").trim();

  if (!href || /^javascript:/i.test(href)) {
    return "";
  }

  if (/^(https?:|mailto:)/i.test(href)) {
    return href;
  }

  return `https://${href.replace(/^\/+/, "")}`;
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
