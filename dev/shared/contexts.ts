import React from 'react'
import { Blog } from '../blog/blog.schema'

export const ConfirmMessageContext = React.createContext<React.MutableRefObject<string>>({ current: '' })

export const BlogPageContext = React.createContext<React.MutableRefObject<Blog | undefined>>({ current: undefined })
