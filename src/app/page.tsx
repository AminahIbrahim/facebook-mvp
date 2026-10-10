import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/prisma";
import Link from "next/link";
import { createPost, toggleLike, addComment } from "@/app/actions/postActions";

export default async function Home() {
  const session = await auth();

  // Agar user logged in hai, toh Real Facebook Dashboard dikhayein
  if (session?.user) {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm h-14 px-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600 tracking-tighter">facebook</h1>
            <div className="hidden md:flex items-center bg-[#f0f2f5] rounded-full px-3 py-1.5 w-64">
              <span className="text-gray-400 text-sm mr-2">🔍</span>
              <input type="text" placeholder="Search Facebook" className="bg-transparent text-sm outline-none w-full text-gray-700" />
            </div>
          </div>

          {/* Center Navigation Icons */}
          <div className="hidden md:flex items-center h-full gap-8">
            <button className="h-full border-b-4 border-blue-600 px-6 flex items-center text-blue-600 text-xl font-bold">🏠</button>
            <button className="h-full px-6 flex items-center text-gray-500 hover:bg-gray-100 text-xl">📺</button>
            <button className="h-full px-6 flex items-center text-gray-500 hover:bg-gray-100 text-xl">👥</button>
            <button className="h-full px-6 flex items-center text-gray-500 hover:bg-gray-100 text-xl">🛒</button>
          </div>

          {/* Right User profile & Log Out */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center font-bold text-gray-700">
              {session.user.name?.[0] || "U"}
            </div>
            <span className="hidden lg:inline text-sm font-semibold text-gray-800">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-md text-gray-700 font-medium transition">
              Log Out
            </Link>
          </div>
        </header>

        {/* Main Body Layout (Sidebar + Feed) */}
        <div className="flex justify-between max-w-7xl mx-auto pt-4 px-2">
          
          {/* Left Sidebar Links */}
          <aside className="hidden lg:block w-72 space-y-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pr-2">
            <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">{session.user.name?.[0]}</div>
              <span className="font-semibold text-gray-700 text-sm">{session.user.name}</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200 rounded-lg cursor-pointer transition text-gray-700 font-medium text-sm">
              <span>👥</span> Friends
            </div>
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200 rounded-lg cursor-pointer transition text-gray-700 font-medium text-sm">
              <span>💾</span> Saved
            </div>
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200 rounded-lg cursor-pointer transition text-gray-700 font-medium text-sm">
              <span>👥</span> Groups
            </div>
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200 rounded-lg cursor-pointer transition text-gray-700 font-medium text-sm">
              <span>📹</span> Reels
            </div>
            <div className="flex items-center gap-3 p-2.5 hover:bg-gray-200 rounded-lg cursor-pointer transition text-gray-700 font-medium text-sm">
              <span>🛒</span> Marketplace
            </div>
          </aside>

          {/* Center Feed Content */}
          <main className="w-full max-w-xl mx-auto space-y-4 pb-10">
            {/* Create Post Box */}
            <div className="bg-white p-4 rounded-xl shadow">
              <form action={createPost} className="space-y-3">
                <div className="flex gap-3 items-center">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {session.user.name?.[0]}
                  </div>
                  <textarea
                    name="content"
                    required
                    placeholder={`What's on your mind, ${session.user.name}?`}
                    className="w-full bg-[#f0f2f5] p-2.5 rounded-full px-4 focus:outline-none resize-none text-gray-800 text-sm h-11 pt-2.5"
                    rows={1}
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <select name="category" className="p-1.5 border rounded-md text-xs text-gray-600 bg-white">
                    <option value="GENERAL">General</option>
                    <option value="FASHION">Fashion</option>
                    <option value="ISLAMIC">Islamic</option>
                    <option value="POETRY">Poetry</option>
                    <option value="MOTIVATIONAL">Motivational</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-1.5 rounded-md font-semibold text-sm hover:bg-blue-700 transition"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => {
                const isLiked = post.likes.some((like) => like.userId === session.user?.id);

                return (
                  <div key={post.id} className="bg-white rounded-xl shadow pb-2">
                    {/* Post Author Header */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm">
                          {post.author.name?.[0] || "U"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{post.author.name || "User"}</h4>
                          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">#{post.category}</span>
                    </div>

                    {/* Post Text Content */}
                    <p className="px-4 py-2 text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p>

                    {/* Likes and Comments Count bar */}
                    <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-500 border-b mx-3">
                      <span>👍 {post.likes.length} Likes</span>
                      <span>{post.comments.length} Comments · 0 Shares</span>
                    </div>

                    {/* Action Buttons (Like, Comment, Share) */}
                    <div className="flex justify-around py-1 border-b mx-2 text-gray-600 font-semibold text-sm">
                      <form action={async () => {
                        "use server";
                        await toggleLike(post.id);
                      }} className="w-1/3 flex justify-center">
                        <button type="submit" className={`w-full py-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1.5 transition ${isLiked ? "text-blue-600" : "text-gray-600"}`}>
                          <span>👍</span> {isLiked ? "Liked" : "Like"}
                        </button>
                      </form>

                      <button type="button" className="w-1/3 py-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1.5 text-gray-600 transition">
                        <span>💬</span> Comment
                      </button>

                      <button type="button" className="w-1/3 py-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1.5 text-gray-600 transition">
                        <span>↗️</span> Share
                      </button>
                    </div>

                    {/* Comments Section */}
                    <div className="p-3 space-y-3 bg-gray-50 rounded-b-xl">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2 items-start text-sm">
                          <div className="bg-gray-300 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs shrink-0">
                            {comment.author.name?.[0] || "U"}
                          </div>
                          <div className="bg-gray-200 p-2.5 rounded-2xl max-w-[85%]">
                            <span className="font-semibold text-gray-900 block text-xs">{comment.author.name}</span>
                            <span className="text-gray-700 text-xs">{comment.content}</span>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <form action={async (formData) => {
                        "use server";
                        const text = formData.get("commentText") as string;
                        await addComment(post.id, text);
                      }} className="flex gap-2 pt-1">
                        <input
                          type="text"
                          name="commentText"
                          placeholder="Write a comment..."
                          required
                          className="flex-1 bg-white border px-3 py-1.5 text-xs rounded-full focus:outline-none focus:border-blue-500 text-gray-800"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 text-xs rounded-full font-semibold hover:bg-blue-700 transition">
                          Reply
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Right Sidebar (Contacts / Sponsors) */}
          <aside className="hidden xl:block w-72 p-2 sticky top-16 h-[calc(100vh-4rem)]">
            <h3 className="text-gray-500 font-semibold text-sm mb-3">Sponsored</h3>
            <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
              <p className="text-xs font-bold text-gray-800">Next.js & Tailwind Masterclass</p>
              <p className="text-[11px] text-gray-500">Build full-stack MVPs quickly.</p>
            </div>
            <h3 className="text-gray-500 font-semibold text-sm mb-3 border-t pt-3">Contacts</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-1.5 hover:bg-gray-200 rounded-lg cursor-pointer">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Aminah Ibrahim</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    );
  }

  // Guest Landing Page (Jab user logged in na ho)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 gap-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-2">facebook</h1>
        <p className="text-gray-600 text-xl max-w-md">Connect with friends and the world around you on Facebook MVP.</p>
      </div>
      <div className="flex gap-4 bg-white p-6 rounded-xl shadow-md">
        <Link href="/login" className="rounded-md bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition shadow">Log In</Link>
        <Link href="/register" className="rounded-md bg-green-600 px-8 py-3 text-white font-semibold hover:bg-green-700 transition shadow">Sign Up</Link>
      </div>
    </div>
  );
}