import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/utils/apiError'

const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('file').filter((entry): entry is File => entry instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (!WEB3_STORAGE_TOKEN) {
      return NextResponse.json({ error: 'IPFS not configured' }, { status: 500 })
    }

    const uploadForm = new FormData()
    files.forEach((file) => {
      uploadForm.append('file', file, file.name)
    })

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
      },
      body: uploadForm,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`IPFS upload failed: ${errorBody}`)
    }

    const { cid } = await response.json()
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`

    return NextResponse.json({
      cid,
      url: gatewayUrl,
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

