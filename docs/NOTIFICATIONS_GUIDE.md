# Notifications System Guide

## Overview
The ProConnect notifications system tracks user activities and alerts users about relevant events in real-time.

## When Users Get Notifications

### 1. **FOLLOW** - When Someone Follows You
- **Trigger**: User A clicks the "Follow" button on your profile
- **Notification**: "John Doe started following you"
- **Link**: Directs to the follower's profile
- **Service**: `networking.service.ts`

### 2. **BID_RECEIVED** - When Someone Bids on Your Freelance Project
- **Trigger**: A freelancer submits a bid on your project posting
- **Notification**: "A freelancer placed a bid on your project - 'Web Development'"
- **Link**: Directs to the project details
- **Service**: `freelance.service.ts` (when bid is created)
- **Fields**:
  - Project name
  - Bidder name
  - Bid amount

### 3. **COMMENT** - When Someone Comments on Your Post
- **Trigger**: User comments on your published post/article
- **Notification**: "Someone commented on your post: '[Comment excerpt]'"
- **Link**: Directs to the post
- **Service**: `posts.service.ts` or `networking.service.ts`

### 4. **MESSAGE** - When You Receive a Direct Message
- **Trigger**: Someone sends you a direct message
- **Notification**: "You have a new message from Sarah Smith"
- **Link**: Directs to messaging/chat page
- **Service**: `chat.service.ts` or `messaging.service.ts`

### 5. **LIKE** - When Someone Likes Your Content
- **Trigger**: User clicks like on your post, profile, or project
- **Notification**: "Your post received a like" or "Your profile was liked"
- **Link**: Directs to the liked content
- **Service**: `posts.service.ts` or `profiles.service.ts`

### 6. **JOB_APPLICATION** - When Someone Applies for Your Job Posting
- **Trigger**: A candidate submits an application to your job posting
- **Notification**: "New application for 'Senior Developer' from Jane Smith"
- **Link**: Directs to job applications page
- **Service**: `jobs.service.ts`
- **Fields**:
  - Job title
  - Applicant name
  - Applicant profile

### 7. **JOB_MATCH** - When AI Finds a Job Match for You
- **Trigger**: AI matching engine finds a suitable job for your profile
- **Notification**: "New job opportunity: 'Full-Stack Developer' at TechCorp"
- **Link**: Directs to job details
- **Service**: `ai.service.ts`

### 8. **PROFILE_VERIFIED** - When Your Profile Gets Verified
- **Trigger**: Admin or system verifies your professional credentials
- **Notification**: "Your profile has been verified! ✓"
- **Link**: Directs to profile
- **Service**: `profiles.service.ts`

## Implementation Guide

### To Create a Notification Programmatically:

```typescript
await this.notificationsService.createNotification({
  userId: targetUserId,        // Recipient's user ID
  type: 'FOLLOW',               // Notification type
  title: 'New Follower',         // Short title
  content: 'John Doe started following you',  // Detailed message
  link: '/profile/john-doe',     // Link to relevant page
});
```

### Notification Object Structure:

```typescript
{
  id: string;                    // Unique ID (auto-generated)
  userId: string;                // Recipient user ID
  type: string;                  // Type: FOLLOW, LIKE, COMMENT, MESSAGE, BID_RECEIVED, JOB_APPLICATION, JOB_MATCH, PROFILE_VERIFIED
  title: string;                 // Notification title
  content: string;               // Full notification text
  link?: string;                 // Optional link to action
  isRead: boolean;               // Read status (default: false)
  createdAt: DateTime;           // When created
  updatedAt: DateTime;           // When updated
}
```

## Real-Time Notifications

When a notification is created, it's emitted in real-time via WebSocket (Socket.IO):

```typescript
// Emitted event
this.chatGateway.server.to(`user_${userId}`).emit('newNotification', notification);
```

Frontend listens for:
```typescript
socket.on('newNotification', (notification) => {
  // Handle new notification
  console.log('New notification:', notification);
});
```

## Testing Notifications

### Option 1: Click "Create Test Notifications" Button
- Go to Notifications page
- Click "Create Test Notifications" button
- 5 sample notifications will be created instantly

### Option 2: API Call
```bash
POST /api/notifications/test
```

## Currently Integrated Actions

✅ Test notifications endpoint  
⚠️ Following system (needs integration)  
⚠️ Bidding system (needs integration)  
⚠️ Comments (needs integration)  
⚠️ Direct messaging (needs integration)  
⚠️ Like system (needs integration)  
⚠️ Job applications (needs integration)  

## TODO - Integration Points

These services need to call `notificationsService.createNotification()`:

1. **Networking Service** - When follow/unfollow actions happen
2. **Freelance Service** - When bids are placed
3. **Chat/Messaging Service** - When new messages arrive
4. **Posts Service** - When comments/likes are added
5. **Jobs Service** - When applications are submitted
6. **Admin/Verification Service** - When profiles are verified
7. **AI Service** - When job matches are found
