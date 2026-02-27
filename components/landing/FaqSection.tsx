import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does the competitor tracking stay updated?',
    answer:
      'You manually add competitors with their name, URL, and current price. Sidekick automatically generates undercut alerts when a competitor\'s price drops below yours, surfaced as insights in your notes timeline.',
  },
  {
    question: 'Will this slow down my admin page load speed?',
    answer:
      'No. Sidekick loads data asynchronously after the page renders, with automatic retry logic and an in-memory cache to keep repeat visits fast. It never blocks your core admin interactions.',
  },
  {
    question: 'Is my internal data shared with Shopify?',
    answer:
      'Your team notes and competitor lists are stored on our secure encrypted servers. Shopify only provides the product ID context required to display the correct data. We never share your proprietary insights with third parties.',
  },
];

export default function FaqSection() {
  return (
    <section className="py-24 px-20 bg-[#f3f4f6]">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-12">
          Technical Documentation
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-white border border-[#e5e7eb] rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer active:scale-[0.99] transition-transform"
            >
              <summary className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">{faq.question}</h4>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
