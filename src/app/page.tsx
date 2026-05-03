import { fetchTopStories } from "./hn";
import StoryList from "./StoryList";
import NavBar from "./NavBar";

export default async function Home() {
  const stories = await fetchTopStories(30);

  return (
    <>
      <NavBar />
      <main
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "32px 40px 96px",
        }}
      >
        <StoryList stories={stories} />
      </main>
    </>
  );
}
