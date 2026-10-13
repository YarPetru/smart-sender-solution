import { useParams } from 'react-router'

export function WebhookEditPage() {
  const { id } = useParams()
  return <h1 className="text-2xl font-semibold">Edit webhook {id}</h1>
}
