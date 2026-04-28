"use client";

import { useState } from "react";
import { HNComment, getAge } from "../../hn";

// HN API returns limited HTML subset: <p><a><i><b><pre><code>
// Strip anything executable — same approach as StoryList.tsx
function sanitizeHNHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function ActionBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "#3a3a3a",
        transition: "color 0.1s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#777")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#3a3a3a")}
    >
      {children}
    </button>
  );
}

function CommentNode({
  comment,
  depth,
  isOp,
}: {
  comment: HNComment;
  depth: number;
  isOp: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const age = getAge(comment.time);

  return (
    <div
      style={{
        paddingLeft: depth > 0 ? 20 : 0,
        borderLeft: depth > 0 ? "1px solid #1c1c1c" : "none",
        marginLeft: depth > 0 ? 4 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: collapsed ? 0 : 8,
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "none",
            border: "1px solid #242424",
            borderRadius: 2,
            cursor: "pointer",
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
            color: "#444",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#444")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#242424")}
        >
          {collapsed ? "+" : "−"}
        </button>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: "#888" }}>
          {comment.by}
        </span>

        {isOp && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 500,
              color: "#888",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 2,
              padding: "1px 4px",
              letterSpacing: "0.05em",
            }}
          >
            OP
          </span>
        )}

        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#333" }}>·</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#3a3a3a" }}>{age}</span>
      </div>

      {!collapsed && (
        <>
          <div
            style={{
              fontSize: 13.5,
              lineHeight: 1.7,
              color: "#b0b0b0",
              fontFamily: "var(--font-inter)",
              marginBottom: 10,
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHNHtml(comment.text) }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: comment.children.length > 0 ? 16 : 0 }}>
            <ActionBtn>↑ reply</ActionBtn>
            <ActionBtn>share</ActionBtn>
            <ActionBtn>save</ActionBtn>
            <ActionBtn>report</ActionBtn>
          </div>

          {comment.children.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {comment.children.map((child) => (
                <CommentNode key={child.id} comment={child} depth={depth + 1} isOp={false} />
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
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 22,
              fontWeight: 700,
              color: "#e2e2e2",
              margin: 0,
            }}
          >
            Discussion
          </h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444" }}>
            {totalCount} comments
          </span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {sorts.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                background: sort === s ? "#1a1a1a" : "none",
                border: sort === s ? "1px solid #2a2a2a" : "1px solid transparent",
                borderRadius: 3,
                cursor: "pointer",
                padding: "3px 10px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: sort === s ? "#aaa" : "#444",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { if (sort !== s) (e.currentTarget as HTMLElement).style.color = "#777"; }}
              onMouseLeave={(e) => { if (sort !== s) (e.currentTarget as HTMLElement).style.color = "#444"; }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid #1e1e1e", borderRadius: 4, marginBottom: 32, overflow: "hidden" }}>
        <textarea
          placeholder="Add to the discussion..."
          style={{
            width: "100%",
            background: "#0a0a0a",
            border: "none",
            borderBottom: "1px solid #1a1a1a",
            color: "#888",
            fontFamily: "var(--font-inter)",
            fontSize: 13.5,
            lineHeight: 1.6,
            padding: "14px 16px",
            resize: "none",
            minHeight: 80,
            outline: "none",
          }}
        />
        <div
          style={{
            background: "#080808",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "#333" }}>
            <kbd style={{ background: "#111", border: "1px solid #222", borderRadius: 2, padding: "1px 5px", fontSize: 10, color: "#444" }}>⌘</kbd>
            <kbd style={{ background: "#111", border: "1px solid #222", borderRadius: 2, padding: "1px 5px", fontSize: 10, color: "#444" }}>↵</kbd>
            <span>to post · markdown supported</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "none", border: "1px solid #222", borderRadius: 3, cursor: "pointer", padding: "4px 12px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#444" }}>
              cancel
            </button>
            <button style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, cursor: "pointer", padding: "4px 12px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>
              comment
            </button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#333", textAlign: "center", padding: "40px 0" }}>
          no comments yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sorted.map((c, i) => (
            <div key={c.id}>
              <CommentNode comment={c} depth={0} isOp={c.by === storyAuthor} />
              {i < sorted.length - 1 && (
                <div style={{ height: 1, background: "#111", marginTop: 24 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
