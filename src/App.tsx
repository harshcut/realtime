import * as React from 'react'
import { supabase } from '../utils'
import { Cursor, MousePosition } from './components'

function App() {
  const [mousePosition, setMousePosition] = React.useState<MousePosition>({ x: null, y: null })

  React.useEffect(() => {
    // create a channel with a unique name
    const channel = supabase.channel('room-name')

    const mouseEventHandler = (ev: MouseEvent) => {
      // broadcast client cursor position to the channel
      channel.send({
        type: 'broadcast',
        payload: { x: ev.clientX, y: ev.clientY },
        event: 'cursor-pos',
      })
    }

    // listen for messages from the server
    channel.on('broadcast', { event: 'cursor-pos' }, ({ payload }) => {
      setMousePosition(payload)
    })

    // subscribe registers your client with the server
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        window.addEventListener('mousemove', mouseEventHandler)
      }
    })

    return () => {
      window.removeEventListener('mousemove', mouseEventHandler)
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <>
      <Cursor mousePosition={mousePosition} />
    </>
  )
}

export default App
