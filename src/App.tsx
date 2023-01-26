import * as React from 'react'
import { supabase } from '../utils'
import { Cursor, MousePosition } from './components'

interface User {
  user_id: string
  mouse_position: MousePosition
}

interface Payload<T> {
  type: string
  payload?: T
  event: string
}

const userId = crypto.randomUUID()

function App() {
  const [users, setUsers] = React.useState<Record<string, User>>({})

  React.useEffect(() => {
    // create a channel with a unique name
    const channel = supabase.channel('room-name')

    const mouseEventHandler = (ev: MouseEvent) => {
      // broadcast client cursor position to the channel with user id
      channel.send({
        type: 'broadcast',
        payload: {
          user_id: userId,
          mouse_position: { x: ev.clientX, y: ev.clientY },
        },
        event: 'cursor-pos',
      })
    }

    // listen for messages from the server
    channel.on('broadcast', { event: 'cursor-pos' }, ({ payload }: Payload<User>) => {
      if (!payload) return
      const { user_id, mouse_position } = payload
      setUsers((prev) => ({ ...prev, [user_id]: { user_id, mouse_position } }))
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
      <span>{userId}</span>
      {Object.entries(users).reduce((acc, [_, { mouse_position, user_id }]) => {
        acc.push(<Cursor key={user_id} mousePosition={mouse_position} />)
        return acc
      }, [] as React.ReactElement[])}
    </>
  )
}

export default App
