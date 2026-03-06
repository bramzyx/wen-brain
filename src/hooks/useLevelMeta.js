import { useEffect } from 'react'

export function useLevelMeta(level) {
  useEffect(() => {
    let tag = document.querySelector('meta[property="og:image"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('property', 'og:image')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', `/banners/banner_level${level}.png`)
  }, [level])
}
