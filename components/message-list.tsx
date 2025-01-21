import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`mb-4 p-2 rounded-lg ${
            message.role === 'user' ? 'bg-blue-100 text-blue-900 ml-auto' : 'bg-gray-100 text-gray-900'
          } max-w-[80%]`}
        >
          {message.content}
        </div>
      ))}
    </ScrollArea>
  )
}

