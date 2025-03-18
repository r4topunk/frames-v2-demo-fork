"use client"

import dynamic from "next/dynamic"

const Post = dynamic(() => import("~/components/Post"), {
  ssr: false,
})

export default function App(
  { post }: { post: string[] } = {
    post: ["hive-173115", "@samuelvelizsk8", "fegxlhrj"],
  }
) {
  console.log({ post })
  const [tag, user, postId] = post
  return <Post author={user} permlink={postId} />
}
