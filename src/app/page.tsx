import { fetchTopStories } from "./hn";
import StoryList from "./StoryList";
import ProfileButton from "./ProfileButton";

export default async function Home() {
  const stories = await fetchTopStories(30);

  return (
    <main
      style={{
        maxWidth: 740,
        margin: "0 auto",
        padding: "52px 28px 96px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(52px, 10vw, 76px)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            color: "#ececec",
            marginBottom: 10,
          }}
        >
          Reads
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#808080",
            fontFamily: "var(--font-inter)",
            lineHeight: 1.5,
          }}
        >
          Stories worth a click. Updated as they surface.
        </p>
      </div>

      <StoryList stories={stories} />
    </main>
  );
}
