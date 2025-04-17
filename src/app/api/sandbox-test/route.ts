import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate a sandbox response
  const fakeResponse = {
    payload: [
      {
        marketplace: {
          id: 'ATVPDKIKX0DER',
          countryCode: 'US',
          name: 'Amazon.com',
        },
        participation: {
          isParticipating: true,
          hasSuspendedListings: false,
        },
      },
    ],
  }

  return NextResponse.json(fakeResponse)
}
