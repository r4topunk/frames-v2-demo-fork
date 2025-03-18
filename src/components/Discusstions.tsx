"use client"

import { Discussion } from "@hiveio/dhive"
import { useEffect, useState } from "react"
import sdk, {
  FrameNotificationDetails,
  type Context,
} from "@farcaster/frame-sdk"
import { createStore } from "mipd"

export default function Discussions(
  { discussions }: { discussions: Discussion[] } = { discussions: [] }
) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<Context.FrameContext>()

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context
      setContext(context)

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked")
      })

      console.log("Calling ready")
      sdk.actions.ready({})

      // Set up a MIPD Store, and request Providers.
      const store = createStore()

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails)
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      })
    }

    if (sdk && !isSDKLoaded) {
      console.log("Calling load")
      setIsSDKLoaded(true)
      load()
      return () => {
        sdk.removeAllListeners()
      }
    }
  }, [isSDKLoaded])

  if (discussions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-xl">No discussions available</p>
      </div>
    )
  }

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Hive Discussions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discussions.map((discussion) => (
          <div
            key={`${discussion.author}-${discussion.permlink}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2 line-clamp-2 text-black">
                {discussion.title}
              </h2>

              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <img
                  src={`https://images.hive.blog/u/${discussion.author}/avatar/small`}
                  alt={discussion.author}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="font-medium">{discussion.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(discussion.created)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18l-5.878-5.878a7.499 7.499 0 118.252-12.248A7.5 7.5 0 0110 18z" />
                  </svg>
                  <span>{discussion.net_votes} votes</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                  <span>{discussion.children} comments</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                  </svg>
                  <a
                    href={`https://hive.blog${discussion.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    View on Hive
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
