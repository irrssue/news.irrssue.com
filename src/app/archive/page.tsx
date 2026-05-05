import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Archive() {
  const stories = await fetchStories("best", 30);
  return (
    <>
      <NavBar />
      <main className="page-main">
        <StoryList stories={stories} label="Archive" feed="best" />
      </main>
    </>
  );
}
