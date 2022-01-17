import { GetRequestApiUrl, RequestRestfulAPI, validations } from "../restful-api-frontend-declaration"
import { ApiAccessorFetch, composeUrl } from '../../dist/browser'

const apiAccessor = new ApiAccessorFetch(validations)

export const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI
const getRequestApiUrl: GetRequestApiUrl = composeUrl

async function start() {
  await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
  await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
  await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' } })
  await requestRestfulAPI('PATCH', '/api/blogs/2', { body: { content: 'test222' } })
  await requestRestfulAPI('DELETE', '/api/blogs/2')
}

document.open()
document.write(`<div>
<input id='file' type="file" />
<button id='download'>download</button>
<button id='downloadData'>download data</button>
<button id='getRawText'>get raw text</button>
<div id='container'></div>
</div>`)
document.close()

document.querySelector<HTMLInputElement>('#file')?.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    requestRestfulAPI('POST', '/api/blogs/upload', {
      body: {
        id: 1,
        file: input.files[0],
      },
    })
  }
})
document.querySelector<HTMLButtonElement>('#download')?.addEventListener('click', () => {
  window.open(getRequestApiUrl('/api/blogs/1/download', {
    query: { attachmentFileName: 'a.txt' },
  }), '_blank')
})
document.querySelector<HTMLButtonElement>('#downloadData')?.addEventListener('click', async () => {
  console.info(await requestRestfulAPI('GET', '/api/blogs/1/download'))
})
document.querySelector<HTMLButtonElement>('#getRawText')?.addEventListener('click', async () => {
  console.info(await requestRestfulAPI('GET', '/api/blogs/1/text'))
})

start()
