import { Button, Card, CardBody } from '@nextui-org/react'
import Link from 'next/link'
import { Star, MessageSquareHeart } from 'lucide-react'
import { fetchImagesAnalysis } from '~/server/lib/query'
import TagTable from '~/components/admin/dashboard/TagTable'
import { HandleProps } from '~/types'

export default async function Admin() {
  const getData = async (): Promise<{
    total: number
    showTotal: number
    result: any[]
  }> => {
    'use server'
    return await fetchImagesAnalysis()
  }

  const props: HandleProps = {
    handle: getData,
    args: 'console',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-4">
      <TagTable {...props} />
    </div>
  )
}