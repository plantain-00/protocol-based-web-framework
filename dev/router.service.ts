import { GetPageUrl } from './router-declaration'
import { composeUrl } from '../dist/browser'
import React from 'react'

export const getPageUrl: GetPageUrl = composeUrl

export const ConfirmMessageContext = React.createContext<React.MutableRefObject<string>>({ current: '' })
