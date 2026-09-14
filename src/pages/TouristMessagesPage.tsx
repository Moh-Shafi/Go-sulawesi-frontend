import { useNavigate } from 'react-router-dom'
import ChatPage from './ChatPage'
import TouristLayout from '../components/TouristLayout'

export default function TouristMessagesPage() {
  return (
    <TouristLayout>
      <ChatPage role="tourist" />
    </TouristLayout>
  )
}
