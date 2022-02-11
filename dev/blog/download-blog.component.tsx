import { getRequestApiUrl, requestRestfulAPI } from "../api/fetch.service"

export function DownloadBlog(props: {
  /**
   * blog id
   */
  id: number
}) {
  return (
    <>
      <input
        type="file"
        onChange={(e) => {
          const input = e.target as HTMLInputElement
          if (input.files && input.files.length > 0) {
            requestRestfulAPI('POST', '/api/blogs/upload', {
              body: {
                id: props.id,
                file: input.files[0],
              },
            })
          }
        }}
      />
      <button
        onClick={() => {
          window.open(getRequestApiUrl(`/api/blogs/${props.id}/download`, {
            query: { attachmentFileName: 'a.txt' },
          }), '_blank')
        }}
      >
        download
      </button>
      <button
        onClick={async () => {
          console.info(await requestRestfulAPI('GET', `/api/blogs/${props.id}/download`))
        }}
      >
        download data
      </button>
      <button
        onClick={async () => {
          console.info(await requestRestfulAPI('GET', `/api/blogs/${props.id}/text`))
        }}
      >
        get raw text
      </button>
    </>
  )
}
