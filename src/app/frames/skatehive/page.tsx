import { Metadata } from "next"
import App from "~/app/app"
import { Client } from "@hiveio/dhive"

const appUrl = process.env.NEXT_PUBLIC_URL

const frame = {
  version: "next",
  imageUrl: `${appUrl}/frames/hello/opengraph-image`,
  button: {
    title: "Open post",
    action: {
      type: "launch_frame",
      name: "Farcaster Frames Hive v2 Demo",
      url: `${appUrl}/frames/skatehive/`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
}

export const metadata: Metadata = {
  title: "Hello, world!",
  description: "A simple hello world frame",
  openGraph: {
    title: "Hello, world!",
    description: "A simple hello world frame",
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
}

const client = new Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
])

export default async function HelloFrame() {
  const discussions = await client.database.getDiscussions("trending", {
    tag: "writing",
    limit: 5,
  })
  console.log({ discussions })
  return <App discussions={discussions} />
}
