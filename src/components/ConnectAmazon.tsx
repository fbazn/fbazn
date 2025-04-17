'use client'

export default function ConnectAmazon() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_LWA_CLIENT_ID
    const redirectUri = 'https://fbazn.com/api/callback'

    const authUrl = `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${clientId}&state=fbazn_state&redirect_uri=${encodeURIComponent(redirectUri)}`

    window.location.href = authUrl
  }

  return (
    <button
      onClick={handleConnect}
      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
    >
      Connect Amazon Seller Account
    </button>
  )
}
