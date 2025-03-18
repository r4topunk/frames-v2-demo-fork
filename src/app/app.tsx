"use client"

import { Discussion } from "@hiveio/dhive"
import dynamic from "next/dynamic"

const Discussions = dynamic(() => import("~/components/Discusstions"), {
  ssr: false,
})

export default function App(
  { discussions }: { discussions: Discussion[] } = { discussions: [] }
) {
  return <Discussions discussions={discussions} />
}
