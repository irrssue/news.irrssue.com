import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Threads() {
  const stories = await fetchStories("ask", 30);
  return (
    <>
      <NavBar count={stories.length} />
      <main className="page-main">
        <StoryList stories={stories} label="Threads" titleLinksToComments />
      </main>
    </>
  );
}
