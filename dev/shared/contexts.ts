import React from 'react'

export const ConfirmMessageContext = React.createContext<React.MutableRefObject<string>>({ current: '' })
