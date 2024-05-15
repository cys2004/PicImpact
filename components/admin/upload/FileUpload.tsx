'use client'

import React, { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Upload, ConfigProvider } from 'antd'
import { toast } from 'sonner'
import useSWR from 'swr'
import { fetcher } from '~/utils/fetcher'
import { ExifType, TagType, ImageType } from '~/types'
import { Button, Select, SelectItem, Input, Divider, Card, CardBody, CardHeader, CardFooter } from '@nextui-org/react'
import ExifReader from 'exifreader'
import Compressor from 'compressorjs'

export default function FileUpload() {
  const [alistStorage, setAlistStorage] = useState([])
  const [storageSelect, setStorageSelect] = useState(false)
  const [storage, setStorage] = useState(new Set([] as string[]))
  const [tag, setTag] = useState(new Set([] as string[]))
  const [alistMountPath, setAlistMountPath] = useState(new Set([] as string[]))
  const [exif, setExif] = useState({} as ExifType)
  const [url, setUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [songname, setSongName] = useState('')
  const [artist, setArtist] = useState('')
  const [songurl, setSongUrl] = useState('')
  const [coverurl, setCoverUrl] = useState('')
  const [lrcurl, setLrcUrl] = useState('')
  const [detail, setDetail] = useState('')

  const { data, isLoading } = useSWR('/api/v1/get-tags', fetcher)

  async function loadExif(file: any) {
    try {
      const tags = await ExifReader.load(file)
      const exifObj = {
        make: '',
        model: '',
        bits: '',
        data_time: '',
        exposure_time: '',
        f_number: '',
        exposure_program: '',
        iso_speed_rating: '',
        focal_length: '',
        lens_specification: '',
        lens_model: '',
        exposure_mode: '',
        cfa_pattern: '',
        color_space: '',
        white_balance: '',
      } as ExifType
      exifObj.make = tags?.Make?.description
      exifObj.model = tags?.Model?.description
      exifObj.bits = tags?.['Bits Per Sample']?.description
      exifObj.data_time = tags?.DateTime?.description
      exifObj.exposure_time = tags?.ExposureTime?.description
      exifObj.f_number = tags?.FNumber?.description
      exifObj.exposure_program = tags?.ExposureProgram?.description
      exifObj.iso_speed_rating = tags?.ISOSpeedRatings?.description
      exifObj.focal_length = tags?.FocalLength?.description
      exifObj.lens_specification = tags?.LensSpecification?.description
      exifObj.lens_model = tags?.LensModel?.description
      exifObj.exposure_mode = tags?.ExposureMode?.description
      exifObj.cfa_pattern = tags?.CFAPattern?.description
      exifObj.color_space = tags?.ColorSpace?.description
      exifObj.white_balance = tags?.WhiteBalance?.description
      setExif(exifObj)
      if (tags?.GPSLatitude?.description) {
        setLat(tags?.GPSLatitude?.description)
      } else {
        setLat('')
      }
      if (tags?.GPSLongitude?.description) {
        setLon(tags?.GPSLongitude?.description)
      } else {
        setLon('')
      }
    } catch (e) {
      console.log(e)
    }
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setWidth(Number(img.width))
          setHeight(Number(img.height))
        };
        // @ts-ignore
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.log(e)
    }
  }

  async function submit() {
    try {
      setLoading(true)
      const tagArray = Array.from(tag)
      if (!url || url === '') {
        toast.warning('请先上传文件！')
        return
      }
      if (tagArray.length === 0 || tagArray[0] === '') {
        toast.warning('请先选择标签！')
        return
      }
      const data = {
        tag: tagArray[0],
        url: url,
        preview_url: previewUrl,
        exif: exif,
        detail: detail,
        width: width,
        height: height,
        lat: lat,
        lon: lon,
        songname: songname,
        artist: artist,
        songurl: songurl,
        coverurl: coverurl,
        lrcurl: lrcurl,
      } as ImageType
      const res = await fetch('/api/v1/image-add', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        // @ts-ignore
        body: JSON.stringify(data),
      }).then(res => res.json())
      if (res?.code === 200) {
        toast.success('保存成功！')
      } else {
        toast.error('保存失败！')
      }
    } catch (e) {
      toast.error('保存失败！')
    } finally {
      setLoading(false)
    }
  }

  async function onBeforeUpload(file: any) {
    setPreviewUrl('')
    const storageArray = Array.from(storage)
    const tagArray = Array.from(tag)
    const alistMountPathArray = Array.from(alistMountPath)
    if (storageArray.length === 0 || storageArray[0] === '') {
      toast.warning('请先选择存储！')
      file.abort()
    } else if (storageArray[0] === 'alist' && (alistMountPathArray.length === 0 || alistMountPathArray[0] === '')) {
      toast.warning('请先选择挂载目录！')
      file.abort()
    } else if (tagArray.length === 0 || tagArray[0] === '') {
      toast.warning('请先选择标签！')
      file.abort()
    } else {
      toast.info('正在上传文件！')
    }
  }

  async function getAlistStorage() {
    if (alistStorage.length > 0) {
      setStorageSelect(true)
      return
    }
    try {
      toast.info('正在获取 AList 挂载目录！')
      const res = await fetch('/api/v1/alist-storages', {
        method: 'GET',
      }).then(res => res.json())
      if (res?.code === 200) {
        setAlistStorage(res.data?.content)
        setStorageSelect(true)
      } else {
        toast.error('AList 挂载目录获取失败！')
      }
    } catch (e) {
      toast.error('AList 挂载目录获取失败！')
    }
  }

  const storages = [
    {
      label: 'S3 API',
      value: 's3',
    },
    {
      label: 'Cloudflare R2',
      value: 'r2',
    },
    {
      label: 'AList API',
      value: 'alist',
    }
  ]

  const { Dragger } = Upload;

  async function uploadFile(file: any, type: string) {
    const storageArray = Array.from(storage)
    const alistMountPathArray = Array.from(alistMountPath)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storage', storageArray[0])
    formData.append('type', type)
    formData.append('mountPath', alistMountPathArray[0])
    return await fetch('/api/v1/file-upload', {
      method: 'POST',
      body: formData
    }).then((res) => res.json())
  }

  async function uploadPreviewImage(option: any, type: string) {
    new Compressor(option.file, {
      quality: 0.3,
      checkOrientation: false,
      convertTypes: ['image/jpeg'],
      async success(compressedFile) {
        if (compressedFile instanceof File) {
          const res = await uploadFile(compressedFile, type)
          if (res?.code === 200) {
            toast.success('预览图片上传成功！')
            option.onSuccess(option.file)
            setPreviewUrl(res?.data)
          } else {
            toast.error('预览图片上传失败！')
          }
        } else {
          const compressedFileFromBlob = new File([compressedFile], option.file.name, {
            type: compressedFile.type,
          });
          const res = await uploadFile(compressedFileFromBlob, type)
          if (res?.code === 200) {
            toast.success('预览图片上传成功！')
            option.onSuccess(option.file)
            setPreviewUrl(res?.data)
          } else {
            toast.error('预览图片上传失败！')
          }
        }
      },
      error(err) {
        console.log(err.message);
        toast.error('预览图片上传失败！')
      },
    })
  }

  async function onRequestUpload(option: any) {
    const tagArray = Array.from(tag)
    const res = await uploadFile(option.file, tagArray[0])
    if (res?.code === 200) {
      toast.success('图片上传成功，尝试生成预览图片并上传！')
      try {
        await uploadPreviewImage(option, tagArray[0] + '/preview')
      } catch (e) {
        console.log(e)
        option.onSuccess(option.file)
      }
      await loadExif(option.file)
      setUrl(res?.data)
    } else {
      option.onError(option.file)
      toast.error('图片上传失败！')
    }
  }

  const props: UploadProps = {
    listType: "picture",
    name: 'file',
    multiple: false,
    maxCount: 1,
    customRequest: (file) => onRequestUpload(file),
    beforeUpload: async (file) => await onBeforeUpload(file),
    onRemove: (file) => {
      setStorageSelect(false)
      setStorage(new Set([] as string[]))
      setTag(new Set([] as string[]))
      setAlistMountPath(new Set([] as string[]))
      setExif({} as ExifType)
      setUrl('')
      setDetail('')
      setWidth(0)
      setHeight(0)
      setLat('')
      setLon('')
      setSongName('')
      setArtist('')
      setSongUrl('')
      setCoverUrl('')
      setLrcUrl('')
      setPreviewUrl('')
    }
  }

  return (
    <div className="flex flex-col space-y-2 h-full flex-1">
      <Card shadow="sm">
        <CardHeader className="justify-between">
          <div className="flex gap-5">
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600 select-none">上传</h4>
            </div>
          </div>
          <Button
            color="primary"
            radius="full"
            size="sm"
            isLoading={loading}
            onClick={() => submit()}
          >
            提交
          </Button>
        </CardHeader>
      </Card>
      <Card shadow="sm" className="flex-1">
        <CardHeader className="flex flex-col space-y-1 pb-1">
          <div className="flex w-full justify-between space-x-1">
            <Select
              isRequired
              size="sm"
              variant="bordered"
              label="存储"
              placeholder="请选择存储"
              selectedKeys={storage}
              onSelectionChange={(keys: any) => {
                const updatedSet = new Set([] as string[]);
                updatedSet.add(keys?.currentKey);
                setStorage(updatedSet)
                if (keys?.currentKey === 'alist') {
                  getAlistStorage()
                } else {
                  setStorageSelect(false)
                }
              }}
            >
              {storages.map((storage) => (
                <SelectItem key={storage.value} value={storage.value}>
                  {storage.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              isRequired
              size="sm"
              variant="bordered"
              label="标签"
              placeholder="请选择标签"
              isLoading={isLoading}
              selectedKeys={tag}
              onSelectionChange={(keys: any) => {
                const updatedSet = new Set([] as string[]);
                updatedSet.add(keys?.currentKey);
                setTag(updatedSet)
              }}
            >
              <SelectItem key="/" value="/">
                首页
              </SelectItem>
              {data?.map((tag: TagType) => (
                <SelectItem key={tag.tag_value} value={tag.tag_value}>
                  {tag.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="w-full">
            {
              storageSelect && alistStorage?.length > 0
                &&
                <Select
                  isRequired
                  size="sm"
                  variant="bordered"
                  label="目录"
                  placeholder="请选择Alist目录"
                  selectedKeys={alistMountPath}
                  onSelectionChange={(keys: any) => {
                    const updatedSet = new Set([] as string[]);
                    updatedSet.add(keys?.currentKey);
                    setAlistMountPath(updatedSet)
                  }}
                >
                  {alistStorage?.map((storage: any) => (
                    <SelectItem key={storage?.mount_path} value={storage?.mount_path}>
                      {storage?.mount_path}
                    </SelectItem>
                  ))}
                </Select>
            }
          </div>
        </CardHeader>
        <CardBody>
          <ConfigProvider
            theme={{
              "token": {
                "colorTextBase": "#13c2c2"
              }
            }}
          >
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined/>
              </p>
              <p className="ant-upload-text">点击上传文件或拖拽文件到这里</p>
            </Dragger>
          </ConfigProvider>
        </CardBody>
        <CardFooter>
          {
            url && url !== '' &&
            <div className="w-full mt-2 space-y-2">
              <Input
                size="sm"
                isReadOnly
                type="text"
                label="图片地址"
                variant="bordered"
                value={url}
              />
              {previewUrl && previewUrl !== '' &&
                <Input
                  size="sm"
                  isReadOnly
                  type="text"
                  label="预览图片地址"
                  variant="bordered"
                  value={previewUrl}
                />
              }
              <div className="flex items-center space-x-1 w-full">
                <Input
                  size="sm"
                  isRequired
                  value={String(width)}
                  onValueChange={(value) => setWidth(Number(value))}
                  type="number"
                  variant="bordered"
                  label="宽度 px"
                  placeholder="0"
                />
                <Input
                  size="sm"
                  isRequired
                  value={String(height)}
                  onValueChange={(value) => setHeight(Number(value))}
                  type="number"
                  variant="bordered"
                  label="高度 px"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-1 w-full">
                <Input
                  size="sm"
                  value={songname}
                  onValueChange={(value) => setSongName(value)}
                  type="text"
                  variant="bordered"
                  label="歌曲名称"
                />
                <Input
                  size="sm"
                  value={artist}
                  onValueChange={(value) => setArtist(value)}
                  type="text"
                  variant="bordered"
                  label="艺术家"
                />
              </div>
              <div className="flex items-center space-x-1 w-full">
                <Input
                  size="sm"
                  value={songurl}
                  onValueChange={(value) => setSongUrl(value)}
                  type="text"
                  variant="bordered"
                  label="歌曲文件地址"
                />
                <Input
                  size="sm"
                  value={coverurl}
                  onValueChange={(value) => setCoverUrl(value)}
                  type="text"
                  variant="bordered"
                  label="歌曲封面地址"
                />
                <Input
                  size="sm"
                  value={lrcurl}
                  onValueChange={(value) => setLrcUrl(value)}
                  type="text"
                  variant="bordered"
                  label="歌词地址"
                />
              </div>
              <Input
                size="sm"
                type="text"
                label="描述"
                placeholder="请输入描述"
                variant="bordered"
                value={detail}
                onValueChange={(value: string) => {
                  setDetail(value)
                }}
              />
              <Divider className="my-4"/>
            </div>
          }
        </CardFooter>
      </Card>
    </div>
  )
}