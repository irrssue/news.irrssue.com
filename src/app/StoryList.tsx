"use client";

import { useState } from "react";
import Link from "next/link";
import { HNItem, HNComment, getAge, getDomain, fetchComments } from "./hn";

// HN API returns HTML with <p>, <a>, <i>, <b>, <pre>, <code>
// Strip anything that could execute scripts or load external content
function sanitizeHNHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function CommentNode({ comment, depth }: { comment: HNComment; depth: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const age = getAge(comment.time);

  return (
    <div
      style={{
        paddingLeft: depth > 0 ? 16 : 0,
        borderLeft: depth > 0 ? "2px solid #1e1e1e" : "none",
      }}
    >
      {/* Comment header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: collapsed ? 0 : 6,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            color: "#b3b3b3",
          }}
        >
          {comment.by}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#575757",
          }}
        >
          {age}
        </span>
        {collapsed && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#575757" }}>
            [+]
          </span>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Comment body */}
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.65,
              color: "#e8e8e8",
              fontFamily: "var(--font-inter)",
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHNHtml(comment.text) }}
          />

          {/* Children */}
          {comment.children.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {comment.children.map((child) => (
                <CommentNode key={child.id} comment={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CommentsPanel({
  storyId,
  onClose,
}: {
  storyId: number;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<HNComment[] | null>(null);
  const [loading, setLoading] = useState(false);

  if (!loading && comments === null) {
    setLoading(true);
    fetchComments(storyId).then((c) => {
      setComments(c);
      setLoading(false);
    });
  }

  return (
    <div
      style={{
        background: "#000000",
        border: "1px solid #181818",
        borderRadius: 4,
        padding: "20px 24px",
        marginBottom: 4,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: "1px solid #151515",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#808080",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {loading
            ? "loading..."
            : `${comments?.length ?? 0} top comments`}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#666666",
            padding: 0,
            transition: "color 0.1s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#888")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#666666")
          }
        >
          close ✕
        </button>
      </div>

      {loading && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#4d4d4d",
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          fetching...
        </div>
      )}

      {!loading && comments?.length === 0 && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#4d4d4d",
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          no comments yet
        </div>
      )}

      {!loading && comments && comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {comments.map((c, i) => (
            <div key={c.id}>
              <CommentNode comment={c} depth={0} />
              {i < comments.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background: "#111",
                    marginTop: 20,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryRow({
  story,
  expanded,
  onToggleComments,
  titleLinksToComments,
}: {
  story: HNItem;
  expanded: boolean;
  onToggleComments: () => void;
  titleLinksToComments?: boolean;
}) {
  const age = getAge(story.time);
  const domain = getDomain(story.url);
  const cmtCount = story.descendants ?? 0;

  return (
    <>
      <div className="row">
        <div>
          <p className="ttl">
            {titleLinksToComments ? (
              <Link href={`/story/${story.id}`}>{story.title}</Link>
            ) : (
              <a
                href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {story.title}
              </a>
            )}
            {domain && <span className="dom">{domain}</span>}
          </p>
          <div className="meta">
            <b>{story.score}</b>
            <span>points</span>
            <span className="sep">·</span>
            <span>by {story.by}</span>
            <span className="sep">·</span>
            <span>{age}</span>
          </div>
        </div>
        <Link
          href={`/story/${story.id}`}
          className="cmts"
          aria-label={`${cmtCount} comments`}
          onClick={(e) => {
            if (expanded) {
              e.preventDefault();
              onToggleComments();
            }
          }}
        >
          <b>{cmtCount}</b> comments
        </Link>
      </div>
      {expanded && (
        <CommentsPanel storyId={story.id} onClose={onToggleComments} />
      )}
    </>
  );
}

export default function StoryList({
  stories,
  label = "Front page",
  titleLinksToComments,
  range = "today",
  showRangeFilter = false,
}: {
  stories: HNItem[];
  label?: string;
  titleLinksToComments?: boolean;
  range?: "today" | "week" | "month" | "all";
  showRangeFilter?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function toggleComments(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <div className="page-head">
        <div className="lhs">
          <h1>{label}</h1>
          <span className="meta">{stories.length} links</span>
        </div>
        {showRangeFilter && (
          <div className="filters">
            {(["today", "week", "month", "all"] as const).map((k) => (
              <Link
                key={k}
                href={k === "today" ? "/" : `/?t=${k}`}
                className={range === k ? "on" : ""}
              >
                {k === "all" ? "all-time" : k}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="listA">
        {stories.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            expanded={expandedId === story.id}
            onToggleComments={() => toggleComments(story.id)}
            titleLinksToComments={titleLinksToComments}
          />
        ))}
      </div>
    </>
  );
}
