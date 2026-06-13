// Lightweight client-side exporters (no external dependencies).

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export function downloadCSV(filename: string, rows: (string | number | undefined)[][]) {
  const csv = rows.map(r => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Builds a passenger-level export from a list of bookings.
export function bookingsToRows(bookings: any[]): (string | number | undefined)[][] {
  const header = [
    'Booking Ref', 'Lead Contact', 'Phone', 'Passenger', 'Age', 'Gender',
    'ID Type', 'ID Number', 'Attendance', 'Booking Status',
    'Payment Status', 'Total Amount', 'Amount Paid', 'Payment Ref',
  ]
  const rows: (string | number | undefined)[][] = [header]
  for (const b of bookings) {
    const passengers = b.passengers?.length ? b.passengers : [{ name: b.name }]
    for (const p of passengers) {
      rows.push([
        b.bookingRef, b.name, b.phone, p.name, p.age, p.gender,
        p.idType, p.idNumber, p.attendance, b.status,
        b.paymentStatus, b.totalAmount, b.amountPaid, b.paymentRef,
      ])
    }
  }
  return rows
}
