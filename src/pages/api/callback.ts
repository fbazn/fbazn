import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query
  if (!code || Array.isArray(code)) return res.status(400).send('Missing code')

  try {
    const response = await axios.post('https://api.amazon.com/auth/o2/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.NEXT_PUBLIC_LWA_CLIENT_ID,
        client_secret: process.env.LWA_CLIENT_SECRET,
        redirect_uri: 'https://fbazn.com/api/callback'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const { access_token, refresh_token } = response.data

    console.log('✅ Access token:', access_token)
    console.log('🔁 Refresh token:', refresh_token)

    res.status(200).send('✅ Amazon account connected. You can close this tab.')
  } catch (err) {
    console.error('OAuth Error:', err)
    res.status(500).send('OAuth callback failed.')
  }
}
