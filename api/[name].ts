import { NowRequest, NowResponse } from '@vercel/node'
import { load } from 'cheerio'
import fetch from 'node-fetch'

type Nullable<T> = {
  [K in keyof T]?: T[K] | null
}

interface Repository {
  owner: string,
  repo: string,
  description: string,
  language: string,
  stars: string,
  forks: string,
  fullName: string,
  url: string
}

export default async function (request: NowRequest, response: NowResponse) {
  const name = request.query.name as string

  const $ = await fetch(`https://github.com/${name}`)
    .then(response => response.buffer())
    .then(buffer => load(buffer))

  const result: Nullable<Repository>[] = []

  $('.pinned-item-list-item-content')
    .each((_index, element) => {
      const target = $(element)

      const language = target.find('[itemprop="programmingLanguage"]').text() || null
      const stars = target.find('a[href$="stargazers"]').text().trim() || '0'
      const forks = target.find('a[href$="members"]').text().trim() || '0'
      const description = target.find('.pinned-item-desc').text().trim() || null
      const owner = target.find('.owner').text() || name
      const repo = target.find('.repo').text()

      result.push({
        description,
        fullName: `${owner}/${repo}`,
        language,
        stars,
        forks,
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`
      })
    })

  return response.send(result)
}
