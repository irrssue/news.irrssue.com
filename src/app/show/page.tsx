import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Show() {
  const stories = await fetchStories("show", 30);
  return (
    <>
      <NavBar />
      <main className="page-main">
        <StoryList stories={stories} label="Show HN" feed="show" />
      </main>
    </>
  );
}
