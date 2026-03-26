/**
 * Meeting room management: capacity and availability.
 * Rooms have a capacity; bookings are time-slot based.
 */

export interface TimeSlot {
  start: Date
  end: Date
}

export interface Booking {
  roomId: string
  slot: TimeSlot
  title?: string
}

export class MeetingRoom {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capacity: number
  ) {
    if (capacity < 1) throw new Error('Capacity must be at least 1')
  }
}

export class MeetingRoomManager {
  private readonly rooms = new Map<string, MeetingRoom>()
  private readonly bookings = new Map<string, Booking[]>() // roomId -> bookings

  addRoom(room: MeetingRoom): this {
    if (this.rooms.has(room.id)) {
      throw new Error(`Room ${room.id} already exists`)
    }
    this.rooms.set(room.id, room)
    this.bookings.set(room.id, [])
    return this
  }

  removeRoom(roomId: string): void {
    if (!this.rooms.has(roomId)) return
    this.rooms.delete(roomId)
    this.bookings.delete(roomId)
  }

  getRoom(roomId: string): MeetingRoom | undefined {
    return this.rooms.get(roomId)
  }

  getAllRooms(): MeetingRoom[] {
    return Array.from(this.rooms.values())
  }

  /**
   * Returns rooms that have at least `minCapacity`.
   */
  getRoomsByCapacity(minCapacity: number): MeetingRoom[] {
    return this.getAllRooms().filter((room) => room.capacity >= minCapacity)
  }

  /**
   * Returns rooms that have at least `minCapacity` and are free for the given slot.
   */
  getAvailableRooms(slot: TimeSlot, minCapacity: number): MeetingRoom[] {
    return this.getAllRooms().filter(
      (room) =>
        room.capacity >= minCapacity && this.isRoomAvailable(room.id, slot)
    )
  }

  /**
   * True if the room has no overlapping booking in the given slot.
   */
  isRoomAvailable(roomId: string, slot: TimeSlot): boolean {
    const list = this.bookings.get(roomId)
    if (!list) return false
    return !list.some((b) => this.slotsOverlap(b.slot, slot))
  }

  private slotsOverlap(booking: TimeSlot, currentBookingSlot: TimeSlot): boolean {
    return booking.start < currentBookingSlot.end && currentBookingSlot.start < booking.end
  }

  /**
   * Books a room for the given slot. Throws if room doesn't exist or slot is taken.
   */
  book(roomId: string, slot: TimeSlot, title?: string): Booking {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)
    if (!this.isRoomAvailable(roomId, slot)) {
      throw new Error(`Room ${roomId} is not available for the requested slot`)
    }
    const booking: Booking = { roomId, slot, title }
    this.bookings.get(roomId)!.push(booking)
    return booking
  }

  /**
   * Cancels the first booking that matches room and overlapping slot.
   */
  cancel(roomId: string, slot: TimeSlot): boolean {
    const list = this.bookings.get(roomId)
    if (!list) return false
    const idx = list.findIndex((b) => this.slotsOverlap(b.slot, slot))
    if (idx === -1) return false
    list.splice(idx, 1)
    return true
  }

  getBookings(roomId: string): readonly Booking[] {
    return this.bookings.get(roomId) ?? []
  }
}

// --- Example usage ---

const manager = new MeetingRoomManager()

manager
  .addRoom(new MeetingRoom('r1', 'Small', 4))
  .addRoom(new MeetingRoom('r2', 'Medium', 10))
  .addRoom(new MeetingRoom('r3', 'Large', 20))

const slot: TimeSlot = {
  start: new Date('2025-02-01T09:00:00'),
  end: new Date('2025-02-01T10:00:00'),
}

manager.book('r1', slot, 'Standup')
manager.cancel('r1', slot)
const available = manager.getAvailableRooms(slot, 5)
console.log('Rooms with capacity >= 5 available at 9–10:', available.map((r) => r.name))

const bigRooms = manager.getRoomsByCapacity(15)
console.log('Rooms with capacity >= 15:', bigRooms.map((r) => r.name))
