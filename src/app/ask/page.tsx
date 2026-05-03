import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Ask() {
  const stories = await fetchStories("ask", 30);
  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 740, margin: "0 auto", padding: "44px 28px 96px" }}>
        <StoryList stories={stories} label="Ask HN" titleLinksToComments />
      </main>
    </>
  );
}
