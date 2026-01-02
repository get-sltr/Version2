import Link from 'next/link'
import { Sparkles, Check, Clock, Lock } from 'lucide-react'

export default function NewYearPromo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-black text-white">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium">New Year 2026 Launch Special</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Lock In <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">$4.99/month</span>
          <br />Forever
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          Join SLTR during our New Year launch and pay just $4.99/month—locked in for life.
        </p>

        {/* Urgency */}
        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-8">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">Limited time offer • Ends January 31, 2026</span>
        </div>

        {/* Pricing Box */}
        <div className="max-w-md mx-auto bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-5xl font-bold">$4.99</span>
            <span className="text-gray-400">/month</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 text-green-400">
            <Lock className="w-5 h-5" />
            <span className="font-semibold">Price locked forever</span>
          </div>

          <ul className="space-y-3 mb-8 text-left">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Unlimited matches & messages</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Advanced filters & preferences</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">See who viewed your profile</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Ad-free experience</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Priority customer support</span>
            </li>
          </ul>

          <a
            href="https://getsltr.com/signup?promo=newyear2026"
            className="block w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/50"
          >
            Lock In $4.99/Month Forever
          </a>

          <p className="text-xs text-gray-400 mt-4">
            Regular price: $9.99/month after promotion ends
          </p>
        </div>

        {/* Social Proof */}
        <p className="text-sm text-gray-400">
          Join thousands of LGBTQ+ singles finding authentic connections
        </p>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-pink-400">1</span>
            </div>
            <h3 className="font-semibold mb-2">Sign Up Now</h3>
            <p className="text-sm text-gray-400">Create your account before January 31, 2026</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-400">2</span>
            </div>
            <h3 className="font-semibold mb-2">Subscribe at $4.99</h3>
            <p className="text-sm text-gray-400">Enable auto-renewal to lock in your rate</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-400">3</span>
            </div>
            <h3 className="font-semibold mb-2">Enjoy Forever</h3>
            <p className="text-sm text-gray-400">Keep $4.99/month rate for as long as you stay subscribed</p>
          </div>
        </div>
      </div>

      {/* Terms Preview */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-bold text-center mb-8">Important Information</h2>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 space-y-4 text-sm text-gray-300">
          <p>
            <strong className="text-white">Lifetime Price Lock Guarantee:</strong> By subscribing to SLTR at $4.99/month during this New Year promotion, you lock in this rate for the lifetime of your subscription, as long as your subscription remains active and in good standing.
          </p>
          
          <p>
            <strong className="text-white">Cancellation:</strong> If you cancel your subscription at any time, you will lose access to the $4.99/month promotional rate. Resubscribing after cancellation will be at the current standard rate ($9.99/month or higher).
          </p>

          <p>
            <strong className="text-white">Payment Issues:</strong> If your payment method is declined, expires, or we are unable to process payment for any reason, and you do not update your payment information within 7 days, your subscription will be cancelled and you will lose the promotional rate.
          </p>

          <p>
            <strong className="text-white">Account Violations:</strong> Any violation of SLTR's Terms of Service may result in account suspension or termination, voiding this promotional rate.
          </p>

          <Link href="/promo-terms" className="inline-block text-pink-400 hover:text-pink-300 underline">
            Read Full Terms & Conditions →
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Don't Miss Out</h2>
        <p className="text-gray-400 mb-8">This offer ends January 31, 2026. Lock in your rate today.</p>
        
        <a
          href="https://getsltr.com/signup?promo=newyear2026"
          className="inline-block px-12 py-5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-pink-500/50"
        >
          Get Started at $4.99/Month
        </a>
      </div>
    </div>
  )
}
