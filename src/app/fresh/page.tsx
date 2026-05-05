import { fetchStories } from "../hn";
import StoryList from "../StoryList";
import NavBar from "../NavBar";

export default async function Fresh() {
  const stories = await fetchStories("new", 30);
  return (
    <>
      <NavBar />
      <main className="page-main">
        <StoryList stories={stories} label="Fresh" feed="new" />
      </main>
    </>
  );
}
