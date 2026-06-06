'use client'
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function ESewaCheckoutPage() {
    const searchParams = useSearchParams()
    const [payload, setPayload] = useState(null)

    useEffect(() => {
        // Collect all search params into an object to build the form
        const params = {}
        for (const [key, value] of searchParams.entries()) {
            params[key] = value
        }
        setPayload(params)
    }, [searchParams])

    useEffect(() => {
        // Auto-submit the form if we have the payload
        if (payload && payload.amount && payload.signature) {
            document.getElementById('esewa-form').submit()
        }
    }, [payload])

    if (!payload || !payload.amount) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-background text-foreground">
                <p>Initializing eSewa Payment...</p>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] flex flex-col gap-4 items-center justify-center bg-background text-foreground">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-lg animate-pulse text-muted-foreground">Redirecting to eSewa...</p>
            <form 
                id="esewa-form" 
                action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" 
                method="POST"
                className="hidden"
            >
                {Object.entries(payload).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                ))}
            </form>
        </div>
    )
}
