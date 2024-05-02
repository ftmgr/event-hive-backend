
# event-hive-backend


# API Documentation

This document outlines the API routes for the application. Each route includes details about the methods, expected requests, and sample responses.

## General Information

The application is configured to use several middlewares which are initialized in the `config` directory. This setup includes route-specific middleware and error handling.

## Index Routes

**Base Endpoint:** `/api`

Routes under this endpoint are used for general application functionalities.

### Example Route 1: List Something
**Endpoint:** `/api/something`

**Method:** `GET`

**Authorization required:** Yes

**Description:**
Fetch a list of something from the database. Only accessible to authenticated users.

### Request

No parameters required.

### Response

**Code:** 200 OK

**Content:**
```json
[
  {
    "id": 1,
    "name": "Item 1"
  },
  {
    "id": 2,
    "name": "Item 2"
  }
]
```

## Auth Routes

**Base Endpoint:** `/auth`

These routes are related to authentication processes like signing in and signing up.

### Sign In
**Endpoint:** `/auth/signin`

**Method:** `POST`

**Authorization required:** No

**Description:**
Allows users to sign in to the application.

#### Request

**Body:**
```json
{
  "username" : "Your Name",
  "email": "user@example.com",
  "password": "securepassword123",
  "hobbies" : "Driving a Tesla"

}
```

#### Response

**Code:** 200 OK

**Content:**
```json
{
  "message": "Successfully signed in",
  "token": "JWT.token.here"
}
```

**Error Response:**

**Code:** 401 UNAUTHORIZED
**Content:**
```json
{
  "error": "Invalid credentials"
}
```

## Comment Routes

**Base Endpoint:** `/comments`

### Get All Comments for an Event
**Endpoint:** `/comments/event/:eventId`

**Method:** `GET`

**Authorization required:** No

**Description:**
Retrieves all comments associated with a specific event. Each comment includes the commenter's username.

#### Response

**Code:** 200 OK

**Content:**
```json
[
  {
    "_id": "commentId",
    "commentText": "Great event!",
    "commenter": {
      "_id": "userId",
      "username": "user123"
    },
    "eventId": "eventId"
  }
]
```

### Post a New Comment
**Endpoint:** `/comments/`

**Method:** `POST`

**Authorization required:** Yes

**Description:**
Allows authenticated users to post a new comment to an event. The user must provide the text of the comment and the event ID.

#### Request

**Body:**
```json
{
  "commentText": "Looking forward to this!",
  "eventId": "eventId"
}
```

#### Response

**Code:** 201 Created

**Content:**
```json
{
  "_id": "newCommentId",
  "commentText": "Looking forward to this!",
  "eventId": "eventId",
  "commenter": "userId"
}
```

### Update a Comment
**Endpoint: /comments/:commentId**

**Method: PUT**

**Authorization required: Yes (Authenticated users with permission to modify the comment)**

**Description:**
Allows a user to update their comment. The user must provide the new text for the comment.

**Request**
Body:


```json
{
  "commentText": "Updated comment text"
}
```
Response
Code: 200 OK

Content:

json
Copy code
{
  "_id": "commentId",
  "commentText": "Updated comment text",
  "eventId": "eventId",
  "commenter": "userId"
}
Error Response:

Code: 500 Internal Server Error
Content:

json
Copy code
{
  "message": "Error updating comment"
}

### Delete a Comment
Endpoint: /comments/:commentId




## Event Routes

**Base Endpoint:** `/events`

### Get All Events
**Endpoint:** `/events/`

**Method:** `GET`

**Authorization required:** No

**Description:**
Retrieves all events from the database. Each event includes the organizer's username.

#### Response

**Code:** 200 OK

**Content:**
```json
[
  {
    "_id": "eventId",
    "title": "Event Title",
    "description": "Event Description",
    "date": "2024-01-01T00:00:00Z",
    "organizer": {
      "_id": "userId",
      "username": "organizerUsername"
    }
  }
]
```

### Post a New Event
**Endpoint:** `/events/`

**Method:** `POST`

**Authorization required:** Yes

**Description:**
Allows an authenticated user to create a new event. The organizer field is automatically set to the user's ID.

#### Request

**Body:**
```json
{
  "title": "New Event",
  "description": "Description of the event",
  "date": "2024-05-01T00:00:00Z"
}
```

#### Response

**Code:** 201 Created

**Content:**
```json
{
  "_id": "newEventId",
  "title": "New Event",
  "description": "Description of the event",
  "date": "2024-05-01T00:00:00Z",
  "organizer": "userId"
}
```


