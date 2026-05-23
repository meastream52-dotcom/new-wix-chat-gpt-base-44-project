import Link from 'next/link';
import { getSession } from '@/lib/blog-auth';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for casual readers',
    features: [
      'Access to all public articles',
      'Daily newsletter',
      'Community comments',
      'Breaking news alerts',
    ],
    cta: 'Get Started Free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$5',
    period: 'per month',
    description: 'For serious entertainment fans',
    features: [
      'Everything in Free',
      'Ad-free reading experience',
      'Exclusive subscriber content',
      'Early access to reviews',
      'Priority customer support',
      'Cancel anytime',
    ],
    cta: 'Start Premium',
    href: '/signup',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Annual',
    price: '$40',
    period: 'per year',
    description: 'Best value for superfans',
    features: [
      'Everything in Premium',
      'Save $20 vs monthly',
      'Exclusive annual member badge',
      'Early screening invites',
      'Behind-the-scenes content',
      'Annual gift + merch discount',
    ],
    cta: 'Get Annual Plan',
    href: '/signup',
    highlight: false,
    badge: 'Best Value',
  },
];

const faqs = [
  { q: 'Can I cancel at any time?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment processor.' },
  { q: 'Is there a free trial?', a: 'Our Free plan is available forever with no credit card required. Premium features are available immediately upon upgrading.' },
  { q: 'What is "ad-free reading"?', a: 'Premium and Annual subscribers browse all articles without any advertisements or sponsored content banners.' },
];

export default async function SubscribePage() {
  const user = await getSession();

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Hero */}
      <div className="bg-black text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-black mb-3">
          Choose Your <span className="text-[#CC0000]">CinemaRant</span> Plan
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Join thousands of entertainment fans getting the best coverage of movies, TV, gaming, music, and more.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-sm border-2 flex flex-col overflow-hidden relative ${
                plan.highlight ? 'border-[#CC0000] shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className={`text-center text-xs font-black uppercase py-1.5 tracking-wider ${
                  plan.highlight ? 'bg-[#CC0000] text-white' : 'bg-gray-900 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-black text-gray-900">{plan.name}</h2>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={user ? '/account' : plan.href}
                  className={`block text-center font-black py-3 rounded transition-colors ${
                    plan.highlight
                      ? 'bg-[#CC0000] hover:bg-red-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  }`}
                >
                  {user && plan.name === 'Free' ? 'Current Plan' : plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features comparison */}
        <div className="mt-14">
          <h2 className="text-2xl font-black text-center text-gray-900 mb-8">Everything You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📰', title: 'Breaking News', desc: 'Be first to know with our real-time entertainment news updates.' },
              { icon: '🎬', title: 'Expert Reviews', desc: 'In-depth reviews from our team of entertainment journalists.' },
              { icon: '🌟', title: 'Celebrity Coverage', desc: 'The latest on your favorite actors, musicians, and athletes.' },
              { icon: '🎮', title: 'Gaming News', desc: 'Every major release, review, and gaming industry update.' },
              { icon: '📺', title: 'Streaming Guides', desc: 'What to watch on Netflix, HBO, Disney+, and more.' },
              { icon: '🎵', title: 'Music Coverage', desc: 'Album reviews, concert news, and artist interviews.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-black text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="text-2xl font-black text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 mb-4">Still not sure? Start with our free plan — no credit card required.</p>
          <Link
            href="/signup"
            className="inline-block bg-[#CC0000] hover:bg-red-700 text-white font-black px-8 py-3 rounded-lg transition-colors text-lg"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
