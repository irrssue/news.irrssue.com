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

function CommentBadge({ count }: { count: number }) {
  const display = count > 999 ? "999+" : String(count);
  const fontSize = display.length >= 4 ? 8 : display.length === 3 ? 9 : 10;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 32,
        color: "#999999",
        transition: "color 0.1s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.color = "#e2e2e2")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.color = "#999999")
      }
    >
      <svg
        width="36"
        height="32"
        viewBox="0 0 36 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      >
        <path
          d="M4 3h28a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H14l-7 5v-5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        style={{
          position: "relative",
          fontFamily: "var(--font-mono)",
          fontSize,
          fontWeight: 500,
          lineHeight: 1,
          marginTop: -4,
        }}
      >
        {display}
      </span>
    </span>
  );
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
  isLast,
  expanded,
  onToggleComments,
  titleLinksToComments,
}: {
  story: HNItem;
  isLast: boolean;
  expanded: boolean;
  onToggleComments: () => void;
  titleLinksToComments?: boolean;
}) {
  const age = getAge(story.time);
  const domain = getDomain(story.url);

  const titleStyle = {
    display: "block",
    fontSize: 14.5,
    fontWeight: 500,
    color: "#dedede",
    lineHeight: 1.45,
    fontFamily: "var(--font-inter)",
    marginBottom: 7,
    transition: "color 0.1s",
    textDecoration: "none",
  } as const;
  const onEnter = (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget as HTMLElement).style.color = "#fff");
  const onLeave = (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget as HTMLElement).style.color = "#dedede");

  return (
    <div
      style={{
        borderBottom: isLast && !expanded ? "none" : "1px solid #161616",
      }}
    >
      <div className="story-grid">
        {/* Points */}
        <div style={{ textAlign: "right", paddingTop: 2 }}>
          <div className="pts-score">
            {story.score}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#5c5c5c",
              marginTop: 5,
              lineHeight: 1.3,
            }}
          >
            points · {age}
          </div>
        </div>

        {/* Title + meta */}
        <div>
          {titleLinksToComments ? (
            <Link
              href={`/story/${story.id}`}
              style={titleStyle}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              {story.title}
            </Link>
          ) : (
            <a
              href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={titleStyle}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              {story.title}
            </a>
          )}
          <div
            style={{
              fontSize: 11,
              color: "#5c5c5c",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span style={{ color: "#6f6f6f" }}>{domain}</span>
            <span style={{ color: "#454545" }}> · by </span>
            <span style={{ color: "#787878" }}>{story.by}</span>
          </div>
        </div>

        {/* Comments link */}
        <div style={{ textAlign: "right", paddingTop: 2 }}>
          <Link
            href={`/story/${story.id}`}
            aria-label={`${story.descendants ?? 0} comments`}
            style={{
              display: "inline-flex",
              textDecoration: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CommentBadge count={story.descendants ?? 0} />
          </Link>
        </div>
      </div>

      {expanded && (
        <CommentsPanel storyId={story.id} onClose={onToggleComments} />
      )}
    </div>
  );
}

export default function StoryList({
  stories,
  label = "Front page",
  titleLinksToComments,
}: {
  stories: HNItem[];
  label?: string;
  titleLinksToComments?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function toggleComments(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 0,
          paddingBottom: 12,
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#cccccc",
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#4d4d4d",
            fontFamily: "var(--font-mono)",
          }}
        >
          {stories.length} links
        </span>
      </div>

      {/* Story list */}
      <div>
        {stories.map((story, i) => (
          <StoryRow
            key={story.id}
            story={story}
            isLast={i === stories.length - 1}
            expanded={expandedId === story.id}
            onToggleComments={() => toggleComments(story.id)}
            titleLinksToComments={titleLinksToComments}
          />
        ))}
      </div>
    </>
  );
}
