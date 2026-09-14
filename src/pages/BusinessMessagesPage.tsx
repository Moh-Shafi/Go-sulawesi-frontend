import ChatPage from './ChatPage'
import BusinessLayout from '../components/BusinessLayout'

export default function BusinessMessagesPage() {
  return (
    <BusinessLayout>
      <ChatPage role="local" />
    </BusinessLayout>
  )
}
