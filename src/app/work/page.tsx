import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Work() {
  const stories = await fetchStories("job", 30);
  return (
    <>
      <NavBar count={stories.length} />
      <main className="page-main">
        <StoryList stories={stories} label="Work" feed="job" />
      </main>
    </>
  );
}
