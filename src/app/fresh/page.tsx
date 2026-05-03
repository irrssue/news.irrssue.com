import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Fresh() {
  const stories = await fetchStories("new", 30);
  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 40px 96px" }}>
        <StoryList stories={stories} label="Fresh" />
      </main>
    </>
  );
}
