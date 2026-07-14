import React from 'react'
import { AiOutlineLoading } from "./icons"

function Loading({text}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh]">
      <AiOutlineLoading className="text-4xl animate-spin text-primary"/>
      <p className="text-xl">{text}</p>
    </div>
  )
}

export default Loading