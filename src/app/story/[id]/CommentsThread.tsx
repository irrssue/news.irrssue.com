"use client";

import { useState, useMemo } from "react";
import { HNComment, getAge } from "../../hn";

function sanitizeHNHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function countDescendants(c: HNComment): number {
  return c.children.reduce((s, ch) => s + 1 + countDescendants(ch), 0);
}

function PointArrows({ count }: { count: number }) {
  const [v, setV] = useState(0);
  const display = count + v;
  return (
    <span className="vote">
      <button
        type="button"
        className={"arrow" + (v === 1 ? " on" : "")}
        onClick={() => setV(v === 1 ? 0 : 1)}
        aria-label="upvote"
      >
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path d="M8 3l5 6H9v4H7V9H3z" fill="currentColor" />
        </svg>
      </button>
      <span className="count">{display}</span>
      <button
        type="button"
        className={"arrow" + (v === -1 ? " on" : "")}
        onClick={() => setV(v === -1 ? 0 : -1)}
        aria-label="downvote"
      >
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path d="M8 13L3 7h4V3h2v4h4z" fill="currentColor" />
        </svg>
      </button>
    </span>
  );
}

function CommentNode({
  comment,
  isOp,
  storyAuthor,
}: {
  comment: HNComment;
  isOp: boolean;
  storyAuthor: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const age = getAge(comment.time);
  const hidden = useMemo(() => countDescendants(comment), [comment]);
  const points = (comment as HNComment & { score?: number }).score ?? 0;
  const safeHtml = useMemo(() => sanitizeHNHtml(comment.text), [comment.text]);

  return (
    <div className={"comment" + (collapsed ? " collapsed" : "")}>
      <div className="chead-row">
        <button
          type="button"
          className="toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="toggle"
        >
          {collapsed ? "+" : "−"}
        </button>
        <span className={"author" + (isOp ? " op" : "")}>{comment.by}</span>
        <span className="dot">·</span>
        <span className="ago">{age}</span>
        {collapsed && (
          <>
            <span className="dot">·</span>
            <span className="summary">{hidden} hidden</span>
          </>
        )}
      </div>

      {!collapsed && (
        <>
          <div
            className="body"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          <div className="actions">
            <PointArrows count={points} />
            <button type="button">
              <svg
                viewBox="0 0 16 16"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 4L4 8l5 4" />
                <path d="M4 8h6a3 3 0 0 1 3 3v1" />
              </svg>
              reply
            </button>
            <button type="button">share</button>
            <button type="button">save</button>
            <button type="button">report</button>
          </div>

          {comment.children.length > 0 && (
            <div className="children">
              {comment.children.map((child) => (
                <CommentNode
                  key={child.id}
                  comment={child}
                  isOp={child.by === storyAuthor}
                  storyAuthor={storyAuthor}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

type SortMode = "best" | "top" | "new" | "old" | "controversial";

function sortComments(comments: HNComment[], mode: SortMode): HNComment[] {
  const arr = [...comments];
  if (mode === "new") return arr.sort((a, b) => b.time - a.time);
  if (mode === "old") return arr.sort((a, b) => a.time - b.time);
  return arr;
}

export default function CommentsThread({
  comments,
  storyAuthor,
  totalCount,
}: {
  comments: HNComment[];
  storyAuthor: string;
  totalCount: number;
}) {
  const [sort, setSort] = useState<SortMode>("best");
  const sorted = sortComments(comments, sort);
  const sorts: SortMode[] = ["best", "top", "new", "old", "controversial"];

  return (
    <div>
      <div className="chead">
        <h2>
          Discussion <span className="n">{totalCount} comments</span>
        </h2>
        <div className="sort">
          {sorts.map((s) => (
            <span
              key={s}
              className={"chip" + (s === sort ? " on" : "")}
              onClick={() => setSort(s)}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="composer">
        <textarea placeholder="Add to the discussion…" rows={2} />
        <div className="row">
          <span className="hint">
            <kbd>⌘</kbd>
            <kbd>↵</kbd> to post · markdown supported
          </span>
          <div>
            <button type="button" className="ghost">
              cancel
            </button>
            <button type="button">comment</button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-thread">no comments yet</div>
      ) : (
        <div className="thread">
          {sorted.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              isOp={c.by === storyAuthor}
              storyAuthor={storyAuthor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
