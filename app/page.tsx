"use client"
import { Button } from "@/components/ui/button"
import { createAppwriteClient } from "@/lib/appwrite"

async function sendPing() {
   const client = createAppwriteClient();

    try {
      const result = await client.ping();
      console.log("Appwrite server is reachable:", result);
    } catch (err) {
      console.log("Error pinging Appwrite server:", err);
    }
  }


export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button onClick={sendPing} className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
