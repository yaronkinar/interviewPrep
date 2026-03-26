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
  capacity: number
}

export interface MeetingRoom {
  id: string
  name: string
  capacity: number
  bookings?: Booking[]
}

export class MeetingRoomManager {
  private readonly rooms = new Map<string, MeetingRoom>()
  private readonly bookings = new Map<string, Booking[]>() // roomId -> bookings

  addRoom(room: MeetingRoom): this {
    let exist = this.rooms.get(room.id);
    if(exist) throw new Error(
      `Room ${room.id} already exists`
    )
    room.bookings = []
    this.rooms.set(room.id, room)
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
    return this.getAllRooms().filter((room) => room.capacity >= minCapacity && this.isRoomAvailable(room.id, slot,minCapacity))

  }

  /**
   * True if the room has no overlapping booking in the given slot.
   */
  isRoomAvailable(roomId: string, slot: TimeSlot,capacity:number): boolean {
    const list = this.rooms.get(roomId)?.bookings
    if (!list) return false
    return !list.some((availableBooking) => {
      return availableBooking.slot.start < slot.end && slot.start < availableBooking.slot.end
    })

  }

  private slotsOverlap(availableBooking: TimeSlot, desiredBooking: TimeSlot): boolean {
    return desiredBooking.end > availableBooking.start && desiredBooking.start < availableBooking.end

  }

  /**
   * Books a room for the given slot. Throws if room doesn't exist or slot is taken.
   */
  book(value:Booking): Booking {
    const {roomId, slot,capacity, title} = value
    const room = this.rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)
    if (!this.isRoomAvailable(roomId, slot,capacity )) {
      throw new Error(`Room ${roomId} is not available for the requested slot`)
    }
    if(slot.start > slot.end) throw new Error(
      `Slot start time must be before end time`
    )
    const booking: Booking = { roomId, slot, title,capacity }
    this.rooms.get(roomId)?.bookings?.push(booking)
    this.rooms.get(roomId)?.bookings?.sort((a,b) => a.capacity - b.capacity)
     return booking


  }

  /**
   * Cancels the first booking that matches room and overlapping slot.
   */
  cancel(roomId: string, slot: TimeSlot): boolean {
    const list = this.bookings.get(roomId)
    if (!list) return false
    const idx = list.findIndex((availableBooking) => this.slotsOverlap(availableBooking.slot, slot))
    if (idx === -1) return false
    list.splice(idx, 1)
    return true

  }

  getBookings(roomId: string): readonly Booking[] {
    return  this.rooms.get(roomId)?.bookings ?? []


  }
}

// --- Example usage ---

const manager = new MeetingRoomManager()

manager
  .addRoom({id: 'r1', name: 'Small', capacity: 4})
  .addRoom({
    id: 'r2',
    name: 'Medium',
    capacity: 10
  })
    .addRoom({
      id: 'r3',
      name: 'Large',
      capacity: 20
    })

const slot: TimeSlot = {
  start: new Date('2025-02-01T09:00:00'),
  end: new Date('2025-02-01T10:00:00'),
}
const newSlot: TimeSlot = {
  start: new Date('2026-02-01T011:00:00'),
  end: new Date('2026-02-01T011:30:00'),
}

manager.book({
  roomId: 'r1',
  slot: slot,
  capacity: 5,
})
manager.book({
  roomId: 'r2',
  slot: newSlot,
  capacity: 15,
})
const available = manager.getAvailableRooms(slot, 5)
console.log('Rooms with capacity >= 5 available at 9–10:', available.map((r) => `name: ${r.name} capacity: ${r.capacity} `))
const bookings = manager.getBookings('r1').map((b) => `title: ${b.title} start: ${b.slot.start.toDateString()} end: ${b.slot.end.toDateString()}`)
console.log('Bookings for room r1:', bookings)