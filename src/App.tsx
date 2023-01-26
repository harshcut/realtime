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
    const channel = supabase.channel('room-name', { config: { presence: { key: userId } } })

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

      mouse_position.x = Math.min(mouse_position.x ?? 0, window.innerWidth - 30)
      mouse_position.y = Math.min(mouse_position.y ?? 0, window.innerHeight - 30)

      setUsers((prev) => ({ ...prev, [user_id]: { user_id, mouse_position } }))
    })

    // add user to state when they join
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      const newId: string = newPresences[0].user_id
      setUsers((prev) => ({
        ...prev,
        [newId]: { user_id: newId, mouse_position: { x: null, y: null } },
      }))
    })

    // remove user from state when they leave
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      const leftId: string = leftPresences[0].user_id
      setUsers((prev) => {
        const { [leftId]: _, ...rest } = prev
        return rest
      })
    })

    // subscribe registers your client with the server
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        window.addEventListener('mousemove', mouseEventHandler)
        channel.track({ user_id: userId })
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
