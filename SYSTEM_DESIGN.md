# System Design & Architecture Specification

## 1. Seat Hold and TTL Mechanism
The seat hold mechanism temporarily reserves selected seats for a configurable Time-To-Live (`HOLD_TTL_MINUTES=10`). When a customer selects seats, the backend executes an atomic database update on the `ShowSeat` collection. The seat's `status` changes from `AVAILABLE` to `HELD`, setting `holdBy = customerId` and `holdExpiresAt = currentTime + 10 mins`. On-the-fly expiration evaluation during query reads guarantees that expired holds immediately show as selectable even prior to background cron execution.

## 2. Abandoned Checkout & Automatic Release
If a customer leaves the checkout page or fails to complete payment before `holdExpiresAt`, the background scheduler (`ttlCleanupJob`, executing every 15 seconds via `node-cron`) identifies seats where `status == HELD` and `holdExpiresAt <= now`. The background job resets `status` to `AVAILABLE`, clears `holdBy` and `holdExpiresAt`, increments the optimistic `version` counter, and broadcasts a Socket.IO event to update all client views in real time.

## 3. Concurrency Protection & Race Condition Prevention
Concurrency control is strictly enforced on the database layer rather than relying on client state. The system uses MongoDB's atomic conditional modification (`findOneAndUpdate`) combined with optimistic locking (`version` field). 

An atomic query pattern is executed:
```js
ShowSeat.findOneAndUpdate({
  _id: seatId,
  $or: [
    { status: 'AVAILABLE' },
    { status: 'HELD', holdExpiresAt: { $lte: now } }
  ]
}, {
  $set: { status: 'HELD', holdBy: customerId, holdExpiresAt: expiresAt },
  $inc: { version: 1 }
});
```
When Customer A and Customer B simultaneously attempt to hold the exact same seat, MongoDB guarantees single-document execution atomicity. Only one query matches the condition `status == AVAILABLE`; the second query fails immediately and receives an HTTP 409 Conflict response.

## 4. Waitlist Queue Architecture
When all seats in a category (`Premium` or `Standard`) are either `HELD` or `BOOKED`, customers can join a category-specific waitlist. The `Waitlist` collection records `customerId`, `eventId`, `category`, `position`, and `status`. Entries are queued in strict First-In, First-Out (FIFO) order indexed by `(eventId, category, status, position)`.

## 5. Booking Cancellation & Auto-Assignment Workflow
When an active booking is cancelled:
1. The `Booking` record is marked `CANCELLED`.
2. Associated `ShowSeat` records are released.
3. The `waitlistService` queries the top FIFO candidate (`status: WAITING`, position #1).
4. If a candidate exists, the released seat status is set to `HELD` for that candidate.
5. A secure, random tokenized `WaitlistOffer` is generated with `expiresAt = now + WAITLIST_OFFER_MINUTES` (5 mins).
6. A notification email is dispatched containing a time-limited redemption link (`/waitlist/offer/:token`).

## 6. Time-Limited Waitlist Offer Escalation
When the customer clicks the offer link, the system verifies `status == OFFERED`, `now < expiresAt`, and seat availability. Upon acceptance, the customer proceeds to checkout. If the customer declines or the offer expires, the background job marks the offer `EXPIRED`, resets the seat, and automatically invokes `triggerWaitlistAllocation` to dispatch the offer to the next FIFO candidate in line.

## 7. QR Code Generation & Nodemailer Integration
Upon successful booking confirmation (`HELD` → `BOOKED`), `qrService` generates a base64 PNG Data URL using the `qrcode` package containing solely the unique, non-sequential booking reference `{"bookingReference": "TKB-2026-XXXXXX"}`. `emailService` dispatches a rich HTML ticket email containing show details and embedded QR image. In local development environments without SMTP credentials, email payloads are logged without interrupting execution.

## 8. Real-Time Seat Status Updates
Real-time state synchronization is implemented using `Socket.IO`. Clients joining an event seat map subscribe to a specific socket room `event:<eventId>`. Whenever seat status mutates (`seat_held`, `seat_released`, `booking_confirmed`, `waitlist_offer`), the backend emits `seat_status_updated` to the room, instantly reflecting seat color changes on all open browser tabs without full page reloads.

## 9. Database Design Decisions
MongoDB compound indexes are established for performance optimization:
- `ShowSeat`: Unique compound index `{ eventId: 1, seatId: 1 }` prevents duplicate active seat records for the same event/seat.
- `ShowSeat`: Compound index `{ status: 1, holdExpiresAt: 1 }` ensures high-speed execution for TTL cleanup queries.
- `Booking`: Unique index on `bookingReference`.
- `Waitlist`: Unique index on `{ customerId: 1, eventId: 1, category: 1 }` preventing duplicate waitlist entries.
