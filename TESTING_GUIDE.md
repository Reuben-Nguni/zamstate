# Quick Start: Testing Real-Time Booking & Messaging

## Prerequisites
- Node.js and npm installed
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- MongoDB connection configured

## Starting the Application

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```
Expected output: `🚀 Server running on http://localhost:5000`

### 2. Start the Frontend
```bash
npm install
npm run dev
```
Expected output: `Local: http://localhost:5173/`

## Testing Booking Feature

### Test Scenario 1: Book from Property Detail

1. Navigate to `/properties` (Properties page)
2. Click on any property to view details
3. You should see a green **"Book a Viewing"** button
4. Click the button to open the booking modal
5. The modal should show:
   - Property name pre-filled
   - Date picker (with today's date as minimum)
   - Time selector (default: 10:00)
   - Notes field (optional)
6. Select a future date and time
7. (Optional) Add notes like "I'd like to see the kitchen"
8. Click **"Send Booking Request"**
9. You should see a toast notification: **"Booking request sent! The owner will confirm shortly."**
10. Verify the booking appears in `/bookings` page

### Test Scenario 2: Book from Bookings Page

1. Navigate to `/bookings` (Bookings page)
2. Click the **"New Booking"** button at the top
3. Modal opens with:
   - Property dropdown (loads from database)
   - Date, time, and notes fields (all empty)
4. Select a property from the dropdown
5. Property name should display in alert box
6. Fill in date, time, and notes
7. Click **"Send Booking Request"**
8. Verify success message and booking appears in list

### Test Scenario 3: View Bookings List

1. Go to `/bookings` page
2. Verify you see:
   - Stats cards showing: Total, Upcoming, Pending, Completed counts
   - Booking list with filtering tabs: "Upcoming", "Past", "All Bookings"
3. Each booking should display:
   - Property date (in circle)
   - Property name
   - Tenant name
   - Status badge (color-coded)
   - Action buttons (Eye, Edit, X to cancel)
4. Click tab buttons to filter bookings

### Test Scenario 4: Cancel a Booking

1. Find a booking with status "pending" or "confirmed"
2. Click the red **X** button (cancel icon)
3. Confirm the delete dialog
4. You should see: **"Booking cancelled"** toast
5. Booking status should change or move to "Past" tab

## Testing Real-Time Messaging

### Prerequisites for Messaging
- User must be logged in
- Message routes configured and working
- Socket.IO server listening

### Test Scenario 1: Send a Message

1. Navigate to `/messages` (RealTimeMessages page)
2. Left sidebar should show "Conversations" list
3. If no conversations exist:
   - Create a booking with another user (or test manually)
   - Conversation should appear in the list
4. Click on a conversation to select it
5. Right panel should show:
   - Chat header with participant names
   - Message history (empty if new)
   - Message input field at bottom
6. Type a test message: "Hello, I'm interested in viewing!"
7. Press Enter or click Send button
8. Message should:
   - Appear in your message list (right-aligned, green background)
   - Show your name and timestamp
   - Be saved to database
9. Verify via API call: `GET /api/messages/conversation/{conversationId}`

### Test Scenario 2: Real-Time Typing Indicator

1. Open the same conversation on two browser tabs/windows
2. In Tab 1: Start typing in the message input field
3. In Tab 2: You should see **"typing..."** appear below the conversation header
4. Stop typing (wait 2 seconds)
5. In Tab 2: The **"typing..."** indicator should disappear

### Test Scenario 3: Receive Real-Time Message

1. Open the same conversation on two browser tabs/windows
2. In Tab 1: Type and send a message
3. In Tab 2: Message should appear instantly without page refresh
   - Message appears on the left (other user)
   - Shows sender name and timestamp
   - Message is blue/light background

### Test Scenario 4: Message Persistence

1. Send a few messages back and forth
2. Refresh the page (or close and reopen)
3. All previous messages should still appear
4. New messages from the other side should be received in real-time

### Test Scenario 5: Conversation List

1. Go to `/messages` page
2. Left sidebar shows all conversations
3. Most recent message preview shown
4. Unread message badge (if applicable)
5. Clicking a conversation loads its messages
6. Previous conversation messages should load from database

## Testing Connection Recovery

### Test Scenario: WebSocket Reconnection

1. Open `/messages` page
2. Open browser DevTools (F12)
3. Go to Network tab
4. Filter by "WS" (WebSocket)
5. You should see a WebSocket connection to `localhost:5000`
6. Send a message (should succeed)
7. Close the WebSocket connection manually
8. Try sending another message
9. Socket should automatically reconnect
10. Message should eventually be delivered

## Common Issues & Solutions

### Issue: Modal doesn't open
- **Solution**: Check browser console for errors
- **Check**: BookingModal component is imported in Bookings.tsx and PropertyDetail.tsx

### Issue: "Property not found" error
- **Solution**: Ensure at least one property exists in database
- **Check**: Navigate to `/properties` and verify properties display

### Issue: Messages not sending
- **Solution**: Check that backend is running and Socket.IO is initialized
- **Check**: Open DevTools → Network tab → look for WS connection

### Issue: Bookings not appearing
- **Solution**: Ensure you're logged in as the booking creator
- **Check**: API call `GET /api/bookings` returns data

### Issue: Socket.IO connection fails
- **Solution**: Check CORS and backend is running
- **Check**: `npm run dev` in server directory shows Socket.IO listening

## Testing Commands

### Test Booking API Directly
```bash
# Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "property": "PROPERTY_ID",
    "date": "2024-12-25T10:00:00Z",
    "time": "10:00",
    "notes": "Test booking"
  }'

# Get all bookings
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test WebSocket Connection
```bash
# In browser console, test socket connection:
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
socket.on('disconnect', () => console.log('Disconnected!'));
```

## Performance Testing

### Load Testing - Multiple Bookings
1. Create 10+ bookings in quick succession
2. Navigate to `/bookings` page
3. Verify page loads within reasonable time
4. List should display all bookings
5. Filtering should work smoothly

### Load Testing - Messages
1. Send 50+ messages in a conversation
2. Navigate to messages page
3. Verify all messages load
4. Scroll performance should be smooth
5. New messages should arrive without lag

## Browser Compatibility Testing

Test on:
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Expected: All features should work consistently

## Final Verification Checklist

- ✅ Can book property from PropertyDetail
- ✅ Can book property from Bookings page
- ✅ Booking appears in list immediately
- ✅ Can cancel booking
- ✅ Booking counts update correctly
- ✅ Can send messages in real-time
- ✅ Typing indicator shows
- ✅ Messages persist after refresh
- ✅ Socket reconnects on disconnect
- ✅ Toast notifications appear
- ✅ No console errors
- ✅ Performance is smooth
- ✅ Mobile responsive

## Production Deployment Checklist

- [ ] Environment variables set (NODE_ENV=production)
- [ ] HTTPS enabled on production
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] CORS origins verified
- [ ] WebSocket security configured
- [ ] Load balancer configured (if multi-server)
- [ ] Database indexed on userId, conversationId
- [ ] CDN configured for static assets
- [ ] Monitoring and alerts set up
- [ ] Deployment script tested

---

For detailed implementation information, see: [BOOKING_AND_MESSAGING_IMPLEMENTATION.md](./BOOKING_AND_MESSAGING_IMPLEMENTATION.md)
