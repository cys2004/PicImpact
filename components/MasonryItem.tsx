'use client'
import {
  Dialog,
  DialogContent,
} from '~/components/ui/Dialog'
import { useButtonStore } from '~/app/providers/button-store-Providers'
import { ImageType } from '~/types'
import { Image, Tabs, Tab, Card, CardHeader } from '@nextui-org/react'
import { Aperture } from 'lucide-react'
import { Twikoo } from '../components/Twikoo'

export default function MasonryItem() {
  const { MasonryView, MasonryViewData, setMasonryView, setMasonryViewData } = useButtonStore(
    (state) => state,
  )

  return (
    <Dialog
      defaultOpen={false}
      open={MasonryView}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setMasonryView(false)
          setMasonryViewData({} as ImageType)
        }
      }}
    >
      <DialogContent className="flex flex-col">
        <div>
          <p>{MasonryViewData.detail}</p>
        </div>
        <div className="h-full flex flex-col space-y-2 md:grid md:gap-2 md:grid-cols-3 xl:gap-4">
          <div className="md:col-span-2 md:flex md:justify-center md:max-h-[90vh]">
            <Image
              className="object-contain md:max-h-[90vh]"
              alt={MasonryViewData.detail}
              src={MasonryViewData.url}
              radius="none"
              loading="lazy"
            />
          </div>
          <div className="flex w-full flex-col">
            <Tabs aria-label="图片预览选择项" color="primary" variant="bordered">
              <Tab
                key="detail"
                title={
                  <div className="flex items-center space-x-2">
                    <Aperture/>
                    <span>详情</span>
                  </div>
                }
              >
                <div className="flex flex-col space-y-2">
                  <Card className="py-4" shadow="sm">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                      <p className="text-tiny uppercase font-bold">相片描述</p>
                      <h4 className="font-bold text-large">{MasonryViewData.detail || 'N&A'}</h4>
                    </CardHeader>
                  </Card>
                </div>
              </Tab>
              <Tab
                key="comments"
                title={
                  <div className="flex items-center space-x-2">
                    {/* 可以替换为评论相关的图标 */}
                    <span>评论</span>
                  </div>
                }
              >
              <Twikoo />
              </Tab>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
