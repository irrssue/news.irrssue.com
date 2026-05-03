import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Replies() {
  const stories = await fetchStories("top", 30);
  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 740, margin: "0 auto", padding: "44px 28px 96px" }}>
        <StoryList stories={stories} label="Replies" />
      </main>
    </>
  );
}
