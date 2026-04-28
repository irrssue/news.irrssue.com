import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchStory, fetchThreadComments, getAge, getDomain } from "../../hn";
import CommentsThread from "./CommentsThread";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const storyId = parseInt(id, 10);
  if (isNaN(storyId)) notFound();

  const [story, comments] = await Promise.all([
    fetchStory(storyId),
    fetchThreadComments(storyId),
  ]);

  if (!story) notFound();

  const age = getAge(story.time);
  const domain = getDomain(story.url);

  return (
    <main className="thread-page">
      <nav className="crumb">
        <Link href="/">Reads</Link>
        <span className="sep">/</span>
        <Link href="/">Front page</Link>
        <span className="sep">/</span>
        <span>thread</span>
      </nav>

      <div className="story-hero">
        <div className="pts">
          {story.score}
          <small>points · {age}</small>
        </div>
        <div>
          <h1>
            {story.url ? (
              <a href={story.url} target="_blank" rel="noopener noreferrer">
                {story.title}
              </a>
            ) : (
              story.title
            )}
          </h1>
          <div className="src">
            {domain}
            <span className="arrow">·</span>
            by <b>{story.by}</b>
            <span className="arrow">·</span>
            {age}
          </div>
        </div>
      </div>

      <CommentsThread
        comments={comments}
        storyAuthor={story.by}
        totalCount={story.descendants ?? 0}
      />
    </main>
  );
}
