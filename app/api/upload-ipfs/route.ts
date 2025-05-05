import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const response = await fetch('https://pump.fun/api/ipfs', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}, message: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("IPFS Upload Response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('IPFS Upload Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}