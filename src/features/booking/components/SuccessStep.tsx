export default function SuccessStep({ bookingRef, onReset }: { bookingRef?: string; onReset: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="text-5xl mb-3">🙏</div>
      <p className="text-green-600 font-semibold text-lg">Registration Complete!</p>
      {bookingRef && (
        <p className="text-xs text-gray-500 mt-1">Booking Ref: <span className="font-mono font-semibold text-gray-700">{bookingRef}</span></p>
      )}
      <p className="text-sm text-gray-500 mt-2">We&apos;ll verify your payment and call you to confirm. Please keep your booking reference handy.</p>
      <button onClick={onReset} className="mt-3 text-sm text-orange-600 underline">Register another</button>
    </div>
  )
}
