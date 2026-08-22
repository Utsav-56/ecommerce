export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  currency: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$',

  esewa: {
    get merchantCode() {
      const code = process.env.ESEWA_MERCHANT_CODE
      if (!code) throw new Error('ESEWA_MERCHANT_CODE is missing in environment variables.')
      return code
    },
    get secretKey() {
      const secret = process.env.ESEWA_SECRET_KEY
      if (!secret) throw new Error('ESEWA_SECRET_KEY is missing in environment variables.')
      return secret
    }
  },

  khalti: {
    get secretKey() {
      let secret = process.env.KHALTI_SECRET_KEY
      if (!secret) throw new Error('KHALTI_SECRET_KEY is missing in environment variables.')
      if (!secret.startsWith('Key ')) {
        secret = `Key ${secret}`
      }
      return secret
    }
  }
}
