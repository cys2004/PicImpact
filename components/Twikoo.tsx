import React, { useEffect } from 'react'

interface TwikooProps {
  imgUrl: string | null;
}

export const Twikoo: React.FC<TwikooProps> = ({ imgUrl }) => {
  useEffect(() => {
    // 通过 CDN 引入 twikoo js 文件
    const cdnScript = document.createElement('script')
    cdnScript.src = 'https://cdn.staticfile.org/twikoo/1.6.25/twikoo.all.min.js'
    cdnScript.async = true
    const envId = process.env.NEXT_PUBLIC_TWIKOO_ENVID

    const loadSecondScript = () => {
      // 执行 twikoo.init() 函数
      const initScript = document.createElement('script')
      initScript.innerHTML = `
            twikoo.init({
              envId: '${ envId }',
              el: '#twikoo-comment',
              path: '${imgUrl}',
            });
          `
      initScript.id = 'twikoo-init-id'
      document.body.appendChild(initScript)
    }

    cdnScript.addEventListener('load', loadSecondScript)
    document.body.appendChild(cdnScript)

    return () => {
      if (loadSecondScript) {
        cdnScript.removeEventListener('load', loadSecondScript)
      }
      if (cdnScript) {
        document.body.removeChild(cdnScript)
      }
      const secondScript = document.querySelector('#twikoo-init-id')
      if (secondScript) {
        document.body.removeChild(secondScript)
      }
    }
  }, [])

  return (
     <div id='twikoo-comment'></div>
  )
}