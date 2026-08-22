import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useAsyncAction() {
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async (actionFn, options = {}) => {
    const { successMessage, errorMessage, onSuccess } = options
    setLoading(true)
    try {
      const res = await actionFn()
      if (res?.success) {
        if (successMessage) toast.success(successMessage)
        if (onSuccess) onSuccess(res)
        return res
      } else {
        const msg = res?.error || errorMessage || 'Operation failed.'
        toast.error(msg)
        return res
      }
    } catch (err) {
      console.error(err)
      toast.error(errorMessage || 'An unexpected error occurred.')
      return { success: false, error: err?.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, execute }
}
