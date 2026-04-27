import { HNItem, getAge, getDomain } from "./hn";

function StoryRow({ story, isLast }: { story: HNItem; isLast: boolean }) {
  const age = getAge(story.time);
  const domain = getDomain(story.url);
  const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "76px 1fr 56px",
        gap: "0 24px",
        padding: "22px 0",
        borderBottom: isLast ? "none" : "1px solid #161616",
        alignItems: "start",
      }}
    >
      {/* Points */}
      <div style={{ textAlign: "right", paddingTop: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1,
            color: "#d0d0d0",
            letterSpacing: "-0.02em",
          }}
        >
          {story.score}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#3d3d3d",
            marginTop: 5,
            lineHeight: 1.3,
          }}
        >
          points · {age}
        </div>
      </div>

      {/* Title + meta */}
      <div>
        <a
          href={story.url ?? hnUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            fontSize: 14.5,
            fontWeight: 500,
            color: "#dedede",
            lineHeight: 1.45,
            fontFamily: "var(--font-inter)",
            marginBottom: 7,
            transition: "color 0.1s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#fff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#dedede")
          }
        >
          {story.title}
        </a>
        <div
          style={{
            fontSize: 11,
            color: "#3d3d3d",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ color: "#4a4a4a" }}>{domain}</span>
          <span style={{ color: "#2e2e2e" }}> · by </span>
          <span style={{ color: "#505050" }}>{story.by}</span>
        </div>
      </div>

      {/* Comments */}
      <div style={{ textAlign: "right", paddingTop: 2 }}>
        <a
          href={hnUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 17,
              fontWeight: 500,
              color: "#666",
              lineHeight: 1,
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#aaa")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#666")
            }
          >
            {story.descendants ?? 0}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#333",
              marginTop: 5,
            }}
          >
            comments
          </div>
        </a>
      </div>
    </div>
  );
}

export default function StoryList({ stories }: { stories: HNItem[] }) {
  return (
    <>
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 18,
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: "#444",
        }}
      >
        <span>
          <span style={{ color: "#aaa" }}>{stories.length}</span> links
        </span>
        <span>
          updated <span style={{ color: "#aaa" }}>live</span>
        </span>
      </div>

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
            color: "#888",
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Front page
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#333",
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
          />
        ))}
      </div>
    </>
  );
}
