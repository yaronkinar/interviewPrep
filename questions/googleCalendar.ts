/**
 * Google Calendar-like implementation
 * Features: Events, Recurring events, Reminders, Multiple calendars
 *
 * Explanation:
 * This is an in-memory calendar domain model with event CRUD, recurrence,
 * conflict detection, search, and free-slot discovery utilities.
 *
 * Interview Thinking Process:
 * 1) Clarify scope: CRUD, recurrence, conflict checks, and querying ranges.
 * 2) Model entities first: Calendar, Event, TimeSlot, Reminder, Recurrence.
 * 3) Choose storage: maps by id for O(1) access and simple in-memory demos.
 * 4) Define overlap rule clearly: [start, end) style interval intersection.
 * 5) Add recurrence generation with hard limits to avoid infinite loops.
 * 6) Add extensions: persistence, indexing, timezone handling, sharing/ACL.
 */

// --- Interfaces ---

export interface TimeSlot {
  start: Date
  end: Date
}

export interface Reminder {
  minutesBefore: number
  type: 'email' | 'popup' | 'notification'
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Recurrence {
  type: RecurrenceType
  interval: number        // every N days/weeks/months/years
  endDate?: Date          // when the recurrence ends
  count?: number          // or after N occurrences
}

export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  location?: string
  slot: TimeSlot
  allDay: boolean
  reminders: Reminder[]
  recurrence?: Recurrence
  color?: string
  attendees: string[]     // email addresses
  createdAt: Date
  updatedAt: Date
}

export interface Calendar {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
  ownerId: string
}

// --- Helper Functions ---

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}

// --- Main Calendar Class ---

export class GoogleCalendar {
  private calendars = new Map<string, Calendar>()
  private events = new Map<string, CalendarEvent>()  // eventId -> event
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    // Create default calendar
    this.createCalendar('Primary', '#4285f4', true)
  }

  // --- Calendar Management ---

  createCalendar(name: string, color: string = '#4285f4', isDefault: boolean = false): Calendar {
    const calendar: Calendar = {
      id: generateId(),
      name,
      color,
      isDefault,
      ownerId: this.userId,
    }

    // If this is set as default, remove default from others
    if (isDefault) {
      this.calendars.forEach(cal => cal.isDefault = false)
    }

    this.calendars.set(calendar.id, calendar)
    return calendar
  }

  getCalendar(calendarId: string): Calendar | undefined {
    return this.calendars.get(calendarId)
  }

  getDefaultCalendar(): Calendar | undefined {
    return Array.from(this.calendars.values()).find(c => c.isDefault)
  }

  getAllCalendars(): Calendar[] {
    return Array.from(this.calendars.values())
  }

  deleteCalendar(calendarId: string): boolean {
    const calendar = this.calendars.get(calendarId)
    if (!calendar) return false
    if (calendar.isDefault) {
      throw new Error('Cannot delete the default calendar')
    }

    // Delete all events in this calendar
    this.events.forEach((event, eventId) => {
      if (event.calendarId === calendarId) {
        this.events.delete(eventId)
      }
    })

    return this.calendars.delete(calendarId)
  }

  // --- Event Management ---

  createEvent(options: {
    title: string
    start: Date
    end: Date
    calendarId?: string
    description?: string
    location?: string
    allDay?: boolean
    reminders?: Reminder[]
    recurrence?: Recurrence
    color?: string
    attendees?: string[]
  }): CalendarEvent {
    const calendarId = options.calendarId ?? this.getDefaultCalendar()?.id
    if (!calendarId || !this.calendars.has(calendarId)) {
      throw new Error('Calendar not found')
    }

    if (options.start >= options.end) {
      throw new Error('End time must be after start time')
    }

    const now = new Date()
    const event: CalendarEvent = {
      id: generateId(),
      calendarId,
      title: options.title,
      description: options.description,
      location: options.location,
      slot: { start: options.start, end: options.end },
      allDay: options.allDay ?? false,
      reminders: options.reminders ?? [{ minutesBefore: 30, type: 'notification' }],
      recurrence: options.recurrence,
      color: options.color,
      attendees: options.attendees ?? [],
      createdAt: now,
      updatedAt: now,
    }

    this.events.set(event.id, event)
    return event
  }

  getEvent(eventId: string): CalendarEvent | undefined {
    return this.events.get(eventId)
  }

  updateEvent(eventId: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>): CalendarEvent {
    const event = this.events.get(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const updatedEvent: CalendarEvent = {
      ...event,
      ...updates,
      id: event.id,           // preserve original id
      createdAt: event.createdAt, // preserve creation time
      updatedAt: new Date(),
    }

    this.events.set(eventId, updatedEvent)
    return updatedEvent
  }

  deleteEvent(eventId: string): boolean {
    return this.events.delete(eventId)
  }

  // --- Querying Events ---

  /**
   * Get events for a specific date range
   */
  getEventsInRange(start: Date, end: Date, calendarId?: string): CalendarEvent[] {
    const events: CalendarEvent[] = []

    this.events.forEach(event => {
      if (calendarId && event.calendarId !== calendarId) return

      // Check if event overlaps with the range
      if (this.slotsOverlap(event.slot, { start, end })) {
        events.push(event)
      }

      // Handle recurring events
      if (event.recurrence) {
        const occurrences = this.getRecurringOccurrences(event, start, end)
        events.push(...occurrences)
      }
    })

    return events.sort((a, b) => a.slot.start.getTime() - b.slot.start.getTime())
  }

  /**
   * Get events for a specific day
   */
  getEventsForDay(date: Date, calendarId?: string): CalendarEvent[] {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return this.getEventsInRange(dayStart, dayEnd, calendarId)
  }

  /**
   * Get events for the current week
   */
  getEventsThisWeek(calendarId?: string): CalendarEvent[] {
    const now = new Date()
    const dayOfWeek = now.getDay()

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    return this.getEventsInRange(weekStart, weekEnd, calendarId)
  }

  /**
   * Search events by title or description
   */
  searchEvents(query: string, calendarId?: string): CalendarEvent[] {
    const lowerQuery = query.toLowerCase()
    const results: CalendarEvent[] = []

    this.events.forEach(event => {
      if (calendarId && event.calendarId !== calendarId) return

      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(event)
      }
    })

    return results.sort((a, b) => a.slot.start.getTime() - b.slot.start.getTime())
  }

  // --- Conflict Detection ---

  /**
   * Check if a time slot conflicts with existing events
   */
  hasConflict(slot: TimeSlot, excludeEventId?: string, calendarId?: string): boolean {
    for (const event of this.events.values()) {
      if (excludeEventId && event.id === excludeEventId) continue
      if (calendarId && event.calendarId !== calendarId) continue

      if (this.slotsOverlap(event.slot, slot)) {
        return true
      }
    }
    return false
  }

  /**
   * Get conflicting events for a time slot
   */
  getConflicts(slot: TimeSlot, calendarId?: string): CalendarEvent[] {
    const conflicts: CalendarEvent[] = []

    this.events.forEach(event => {
      if (calendarId && event.calendarId !== calendarId) return

      if (this.slotsOverlap(event.slot, slot)) {
        conflicts.push(event)
      }
    })

    return conflicts
  }

  // --- Free/Busy ---

  /**
   * Find free time slots in a given range
   */
  findFreeSlots(start: Date, end: Date, minDurationMinutes: number = 30, calendarId?: string): TimeSlot[] {
    const events = this.getEventsInRange(start, end, calendarId)
      .sort((a, b) => a.slot.start.getTime() - b.slot.start.getTime())

    const freeSlots: TimeSlot[] = []
    let currentStart = start

    for (const event of events) {
      // If there's a gap before this event
      if (event.slot.start > currentStart) {
        const gapMinutes = (event.slot.start.getTime() - currentStart.getTime()) / (1000 * 60)
        if (gapMinutes >= minDurationMinutes) {
          freeSlots.push({
            start: new Date(currentStart),
            end: new Date(event.slot.start),
          })
        }
      }

      // Move current pointer past this event
      if (event.slot.end > currentStart) {
        currentStart = event.slot.end
      }
    }

    // Check for free time after the last event
    if (currentStart < end) {
      const gapMinutes = (end.getTime() - currentStart.getTime()) / (1000 * 60)
      if (gapMinutes >= minDurationMinutes) {
        freeSlots.push({
          start: new Date(currentStart),
          end: new Date(end),
        })
      }
    }

    return freeSlots
  }

  // --- Quick Add ---

  /**
   * Quick add event with natural language-like input
   * Example: "Meeting with John tomorrow at 3pm for 1 hour"
   */
  quickAdd(text: string, calendarId?: string): CalendarEvent {
    // Simple parsing - in real implementation, use NLP
    const now = new Date()
    const start = new Date(now)
    start.setHours(start.getHours() + 1, 0, 0, 0) // Default: 1 hour from now

    const end = new Date(start)
    end.setHours(end.getHours() + 1) // Default: 1 hour duration

    return this.createEvent({
      title: text,
      start,
      end,
      calendarId,
    })
  }

  // --- Private Helpers ---

  private slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
    return a.start < b.end && b.start < a.end
  }

  private getRecurringOccurrences(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
    if (!event.recurrence) return []

    const occurrences: CalendarEvent[] = []
    const { type, interval, endDate, count } = event.recurrence
    const duration = event.slot.end.getTime() - event.slot.start.getTime()

    let currentStart = new Date(event.slot.start)
    let occurrenceCount = 0
    const maxOccurrences = count ?? 365 // limit to prevent infinite loops

    while (occurrenceCount < maxOccurrences) {
      // Move to next occurrence
      currentStart = this.getNextOccurrence(currentStart, type, interval)

      // Check if we've passed the end date
      if (endDate && currentStart > endDate) break
      if (currentStart > rangeEnd) break

      occurrenceCount++

      // Skip if before range start
      if (currentStart < rangeStart) continue

      // Create virtual event for this occurrence
      const occurrence: CalendarEvent = {
        ...event,
        id: `${event.id}_${occurrenceCount}`,
        slot: {
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + duration),
        },
      }

      occurrences.push(occurrence)
    }

    return occurrences
  }

  private getNextOccurrence(date: Date, type: RecurrenceType, interval: number): Date {
    switch (type) {
      case 'daily':
        return addDays(date, interval)
      case 'weekly':
        return addWeeks(date, interval)
      case 'monthly':
        return addMonths(date, interval)
      case 'yearly':
        return addYears(date, interval)
    }
  }
}

// --- Example Usage ---

const calendar = new GoogleCalendar('user123')

// Create a work calendar
const workCalendar = calendar.createCalendar('Work', '#0f9d58')

// Create some events
const standup = calendar.createEvent({
  title: 'Daily Standup',
  start: new Date('2026-02-09T09:00:00'),
  end: new Date('2026-02-09T09:30:00'),
  calendarId: workCalendar.id,
  recurrence: {
    type: 'daily',
    interval: 1,
    endDate: new Date('2026-12-31'),
  },
  reminders: [{ minutesBefore: 10, type: 'notification' }],
})

const meeting = calendar.createEvent({
  title: 'Project Review',
  start: new Date('2026-02-09T14:00:00'),
  end: new Date('2026-02-09T15:00:00'),
  description: 'Quarterly project review with stakeholders',
  location: 'Conference Room A',
  attendees: ['john@example.com', 'jane@example.com'],
})

// Query events
console.log("Today's events:", calendar.getEventsForDay(new Date('2026-02-09')).map(e => e.title))
console.log("This week's events:", calendar.getEventsThisWeek().map(e => e.title))

// Find free slots
const freeSlots = calendar.findFreeSlots(
  new Date('2026-02-09T08:00:00'),
  new Date('2026-02-09T18:00:00'),
  60 // minimum 60 minutes
)
console.log('Free 1-hour slots today:', freeSlots.length)

// Check conflicts
const hasConflict = calendar.hasConflict({
  start: new Date('2026-02-09T14:30:00'),
  end: new Date('2026-02-09T15:30:00'),
})
console.log('Has conflict at 2:30 PM:', hasConflict)

// Search
const results = calendar.searchEvents('standup')
console.log('Search results for "standup":', results.length)

