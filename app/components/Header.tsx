import Image from "next/image"
import Link from "next/link"
import { Crown, Clock } from "lucide-react"

export default function Header() {
  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-6">
      <div className="w-full bg-[#0D0F1A] rounded-[24px] sm:rounded-[32px] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src="https://jamez.pro/wp-content/uploads/2025/01/LOGO-jamez-colorbranco-2-1.png"
            alt="Jamez"
            width={120}
            height={40}
            className="h-6 sm:h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center text-yellow-400">
            <Crown size={16} className="mr-1" />
            <span className="text-xs font-medium">Pro</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Clock size={16} className="mr-1" />
            <span className="text-xs font-medium">300 min</span>
          </div>
        </div>
      </div>
    </div>
  )
}

