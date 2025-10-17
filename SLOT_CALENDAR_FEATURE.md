# Slot Calendar Feature

## Overview

Added an Airbnb-style calendar view that displays available and booked dates for individual slots. Users can click the 📅 calendar icon on any slot to view its booking calendar. The calendar supports both **Month View** and **Year View** for better overview and planning.

## Features

### View Modes

Toggle between two view modes:

- **📅 Month View**: Detailed daily calendar for a specific month
- **📆 Year View**: Overview of all 12 months at once

### Month View

- **Monthly calendar display** with navigation between months
- **Color-coded dates**:
  - 🟢 Green: Available dates
  - 🔴 Red: Booked dates
  - 🔵 Blue border: Today's date
- **Booking indicators**: Shows number of bookings on dates with multiple bookings
- **Interactive**: Click on booked dates to see booking details
- **Month navigation**: Use Previous/Next buttons to move between months

### Year View ✨ NEW

- **12-month grid**: See all months of the year at once (4x3 grid on desktop, responsive on mobile)
- **Mini calendars**: Each month shows a condensed calendar with color-coded days
- **Statistics per month**:
  - 🔴 Number of booked days
  - 🟢 Number of available days
- **Click to zoom**: Click any month card to switch to detailed month view
- **Year navigation**: Navigate between years using Previous/Next buttons
- **Responsive layout**:
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 2 columns or 1 column

### Booking Details

When clicking on a booked date in month view, the calendar shows:

- Company name
- Booking period (start and end dates)
- Contact person
- Email address
- Phone number

### Integration

The calendar is available in:

- **Storage Overview page** (`/storage`) - Click 📅 on any slot in the slot grid
- **Storage Details page** (`/storage/:id`) - Click 📅 on any slot when viewing a specific storage

## Usage

### Basic Usage

1. Navigate to the storage overview or storage details page
2. Click the 📅 calendar icon on any slot
3. The calendar opens in Month View by default

### Month View

1. Navigate through months using "Previous" and "Next" buttons
2. Click on booked dates (red) to view booking details
3. View booking count indicators on dates with multiple bookings

### Year View

1. Click the "📆 Year" button at the top to switch to year view
2. Navigate through years using Previous/Next buttons
3. View all 12 months with booking statistics
4. Click any month card to zoom into that month's detailed view
5. Observe the mini calendars to quickly identify busy periods

### Closing

- Click the X button in the header
- Click outside the modal on the overlay

## Technical Implementation

### New Component

- **`SlotCalendarComponent`**: Standalone component that displays the calendar modal
  - Location: `src/app/components/slot-calendar/slot-calendar.component.ts`
  - Inputs: `slot`, `initialDate`
  - Outputs: `close` event
  - Supports: Month view, Year view with view mode toggle

### New Interfaces

```typescript
interface MonthSummary {
  monthIndex: number;
  year: number;
  monthName: string;
  days: CalendarDay[];
  bookedDaysCount: number;
  availableDaysCount: number;
}

type ViewMode = 'month' | 'year';
```

### Updated Components

- **`SlotGridComponent`**: Added calendar icon button and `viewCalendar` event emitter
- **`StorageListComponent`**: Integrated calendar modal
- **`StorageDetailComponent`**: Integrated calendar modal

### Key Methods

- `setViewMode(mode)`: Switch between month and year view
- `generateYearView()`: Generate data for all 12 months
- `goToMonth(monthIndex)`: Switch from year view to specific month
- `previousYear()` / `nextYear()`: Navigate between years

### Styling

- Modern, clean design with smooth animations
- Responsive layout for mobile devices (1-4 column grid)
- Gradient backgrounds for visual hierarchy
- Hover effects for better UX
- Expandable modal width for year view (up to 1200px)
- Grid-based mini calendars in year view
- Color-coded statistics badges

## User Experience Improvements

1. **Visual feedback**: Hover states on all interactive elements
2. **Accessibility**: All buttons have title attributes
3. **Clear legend**: Shows what each color means (in month view)
4. **Smooth animations**: Fade-in and slide-up effects on modal open
5. **Click outside to close**: Modal can be closed by clicking the overlay
6. **View toggle**: Easy switching between month and year views
7. **Quick navigation**: Click month cards to drill down to details
8. **At-a-glance statistics**: See booking status for entire year
9. **Responsive design**: Adapts grid layout based on screen size
10. **Today indicator**: Blue border on current date across all views
