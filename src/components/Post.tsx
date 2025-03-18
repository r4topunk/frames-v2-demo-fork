"use client"
import { Client } from "@hiveio/dhive"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import sdk from "@farcaster/frame-sdk"
import { FrameContext } from "@farcaster/frame-core/dist/context"

const client = new Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
])

// Helper function to extract the first image from post body
function extractFirstImage(body: string): string | null {
  const imgRegex = /!\[.*?\]\((.*?)\)/
  const match = body.match(imgRegex)
  return match ? match[1] : null
}

// Helper function to extract video ID from 3speak URL
function extract3SpeakVideoId(body: string): string | null {
  const regex = /https:\/\/3speak\.tv\/watch\?v=([^/]+\/[^)\s]+)/
  const match = body.match(regex)
  return match ? match[1] : null
}

// Helper to parse JSON metadata
function parseJsonMetadata(jsonString: string) {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return {}
  }
}

async function getData(user: string, postId: string) {
  const postContent = await client.database.call("get_content", [
    user.substring(3),
    postId,
  ])
  if (!postContent) throw new Error("Failed to fetch post content")

  return postContent
}

interface PostProps {
  author: string
  permlink: string
  postData?: any
}

export default function Post({ author, permlink, postData }: PostProps) {
  console.log({ author, permlink, postData })
  const [localData, setLocalData] = useState(postData || null)

  useEffect(() => {
    if (!postData) {
      getData(author, permlink).then((fetched) => setLocalData(fetched))
    }
  }, [author, permlink, postData])

  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<FrameContext>()

  const { address, isConnected } = useAccount()

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context)
      sdk.actions.ready()
    }
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true)
      load()
    }
  }, [isSDKLoaded])

  if (!isSDKLoaded) {
    return <div>Loading...</div>
  }

  if (!localData) return <div>Loading...</div>

  const firstImage = extractFirstImage(localData.body)
  const videoId = extract3SpeakVideoId(localData.body)
  const metadata = parseJsonMetadata(localData.json_metadata)
  const tags = metadata.tags || []
  const createdDate = new Date(localData.created)

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Post Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{localData.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {localData.author.substring(0, 1).toUpperCase()}
            </div>
            <span className="font-medium">@{localData.author}</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">•</span>
          <span className="text-gray-500 dark:text-gray-400">
            {format(createdDate, "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Video Content */}
      {/* {videoId && (
        <div className="mb-8 aspect-video w-full">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://3speak.tv/embed?v=${videoId}`}
            allowFullScreen
          />
        </div>
      )} */}

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none mb-8">
        {firstImage && (
          <div className="mb-6">
            <img
              src={firstImage}
              alt="Post image"
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}

        <div>
          {localData.body
            .replace(/<center>[\s\S]*?<\/center>/g, "") // Remove center tags
            .replace(/!\[.*?\]\(.*?\)/g, "") // Remove markdown images
            .replace(/---/g, "") // Remove dividers
            .split("\n")
            .filter((line: string) => line.trim())
            .map((line: string, i: number) => (
              <p key={i} className="mb-2">
                {line}
              </p>
            ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>{localData.net_votes} votes</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span>{localData.children} comments</span>
        </div>
      </div>
    </div>
  )
}

// Export helper functions for reuse in page.tsx
export { extract3SpeakVideoId, extractFirstImage, parseJsonMetadata }
