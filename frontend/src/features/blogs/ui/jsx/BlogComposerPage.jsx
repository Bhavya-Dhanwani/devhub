"use client";

import Image from "next/image";
import {
  Check,
  Image as ImageIcon,
  MoreHorizontal,
  Pilcrow,
  Redo2,
  Sparkles,
  Undo2,
} from "lucide-react";
import { AuthGuard } from "@/features/auth/ui/jsx/AuthGuard";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useBlogComposer } from "../../hooks/useBlogComposer";
import { WriterAuthPrompt } from "./WriterAuthPrompt";
import styles from "../css/BlogComposer.module.css";

export function BlogComposerPage({ blogId = null }) {
  const composer = useBlogComposer({ blogId });
  const blockOptions = [
    ["paragraph", "Paragraph", "Ctrl Alt 1"],
    ["heading", "Heading", "Ctrl Alt 2"],
    ["subheading", "Subheading", "Ctrl Alt 3"],
    ["quote", "Quote", "Ctrl Alt 4"],
    ["list", "List", "Ctrl Alt 5"],
    ["code", "Code", "Ctrl Alt 6"],
  ];
  const currentShortcut = blockOptions.find(([value]) => value === composer.blockType)?.[2];

  return (
    <AuthGuard fallback={<WriterAuthPrompt />} redirectToLogin={false}>
      <main className={styles.shell}>
        <AppSidebar collapsed />

        <section className={styles.canvas}>
          <header className={styles.topbar}>
            <div aria-hidden="true" />

            <div className={styles.rightActions}>
              <span className={styles.savedState}>
                <Check size={17} />
              </span>
              <button
                aria-label="Undo"
                title="Undo (Ctrl Z)"
                type="button"
                disabled={!composer.canUndo}
                onClick={composer.undo}
              >
                <Undo2 size={16} />
              </button>
              <button
                aria-label="Redo"
                title="Redo (Ctrl Y)"
                type="button"
                disabled={!composer.canRedo}
                onClick={composer.redo}
              >
                <Redo2 size={16} />
              </button>
              <button type="button">
                <Sparkles size={16} />
                AI
              </button>
              <button aria-label="More editor options" type="button">
                <MoreHorizontal size={18} />
              </button>
              <button
                type="button"
                disabled={composer.isPublishing || composer.isLoadingBlog}
                onClick={() => composer.publishBlog("draft")}
              >
                {composer.isEditing ? "Update draft" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={composer.isPublishing || composer.isLoadingBlog}
                onClick={() => composer.publishBlog("published")}
              >
                {composer.isPublishing ? "Saving..." : composer.isEditing ? "Update" : "Publish"}
              </button>
            </div>
          </header>

          <article className={styles.editorSurface}>
            {composer.isLoadingBlog ? (
              <section className={styles.loadingEditor} role="status">
                Loading blog...
              </section>
            ) : null}

            {!composer.isLoadingBlog ? (
              <>
            <div className={styles.inlineTools}>
              <label className={styles.toolButton}>
                <ImageIcon size={15} />
                Cover
                <input accept="image/*" type="file" onChange={composer.onCoverChange} />
              </label>
              <label className={styles.toolButton}>
                <ImageIcon size={15} />
                Image
                <input accept="image/*" type="file" onChange={composer.onInlineImageChange} />
              </label>
              <label className={styles.blockSelectLabel}>
                <Pilcrow size={15} />
                <select
                  aria-label="Block type"
                  value={composer.blockType}
                  onChange={(event) => composer.setBlockType(event.target.value)}
                >
                  {blockOptions.map(([value, label, shortcut]) => (
                    <option value={value} key={value}>
                      {label} · {shortcut}
                    </option>
                  ))}
                </select>
                <kbd>{currentShortcut}</kbd>
              </label>
              <button type="button" onClick={() => composer.insertBlock()}>Add block</button>
            </div>

            {composer.hasInlineImages ? (
              <p className={styles.imageHint}>
                Inline images attached
              </p>
            ) : null}

            {composer.coverPreview ? (
              <div className={styles.coverPreview}>
                <Image src={composer.coverPreview} alt="" width={720} height={240} unoptimized />
              </div>
            ) : null}

            <input
              className={styles.titleInput}
              aria-label="Article title"
              placeholder="Article Title..."
              value={composer.title}
              onKeyDown={composer.onHistoryKeyDown}
              onChange={(event) => composer.setTitle(event.target.value)}
            />

            <input
              className={styles.subheadingInput}
              aria-label="Article subheading"
              placeholder="Subheading"
              value={composer.subheading}
              onKeyDown={composer.onHistoryKeyDown}
              onChange={(event) => composer.setSubheading(event.target.value)}
            />

            <div className={styles.metaFields}>
              <label>
                <span>Category</span>
                <input
                  aria-label="Article category"
                  placeholder="build logs"
                  value={composer.category}
                  onKeyDown={composer.onHistoryKeyDown}
                  onChange={(event) => composer.setCategory(event.target.value)}
                />
              </label>
              <label>
                <span>Tags</span>
                <input
                  aria-label="Article tags"
                  placeholder="react, auth, node"
                  value={composer.tags}
                  onKeyDown={composer.onHistoryKeyDown}
                  onChange={(event) => composer.setTags(event.target.value)}
                />
              </label>
            </div>

            {composer.suggestedTags.length ? (
              <div className={styles.hashtagRow}>
                <span>Detected hashtags</span>
                {composer.suggestedTags.slice(0, 6).map((tag) => (
                  <button key={tag} type="button" onClick={composer.applySuggestedTags}>
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}

            <textarea
              className={styles.bodyInput}
              aria-label="Article body"
              placeholder="Write your post. #hashtags work here."
              value={composer.markdown}
              onKeyDown={composer.onBodyKeyDown}
              onChange={(event) => composer.setMarkdown(event.target.value)}
            />
              </>
            ) : null}
          </article>
        </section>
      </main>
    </AuthGuard>
  );
}
