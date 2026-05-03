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
          maxWidth: 740,
          margin: "0 auto",
          padding: "44px 28px 96px",
        }}
      >
        <StoryList stories={stories} />
      </main>
    </>
  );
}
