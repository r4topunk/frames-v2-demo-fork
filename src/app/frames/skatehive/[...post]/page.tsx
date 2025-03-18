import { Client } from "@hiveio/dhive"
import { Metadata } from "next"
import App from "~/app/app"

// Helper function to extract the first image from post body
function extractFirstImage(body: string): string | null {
  const imgRegex = /!\[.*?\]\((.*?)\)/
  const match = body.match(imgRegex)
  return match ? match[1] : null
}

const appUrl = process.env.NEXT_PUBLIC_URL

interface Props {
  params: Promise<{ post: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await params
  const [tag, user, postId] = post

  // Fetch post data to use in metadata
  const client = new Client([
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network",
  ])

  const postData = await client.database.call("get_content", [
    user.substring(3),
    postId,
  ])

  // Extract first image for preview
  const firstImage = extractFirstImage(postData.body)

  const frame = {
    version: "next",
    imageUrl: firstImage || `${appUrl}/skatehive-default.png`,
    button: {
      title: "Open post",
      action: {
        type: "launch_frame",
        name: "Farcaster Frames Hive v2 Demo",
        url: `${appUrl}/frames/skatehive/${tag}/${user}/${postId}`,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  }
  return {
    title: postData.title,
    description: postData.body.substring(0, 160).replace(/\n/g, " "),
    openGraph: {
      title: postData.title,
      description: postData.body.substring(0, 160).replace(/\n/g, " "),
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  }
}

export default async function Page({ params }: Props) {
  const { post } = await params
  return <App post={post} />
}
