import { useState } from 'react'
import { Search, CircleHelp } from 'lucide-react'

const faqData = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is Interview AI?',
        answer:
          'Interview AI is an AI-powered platform that helps candidates prepare for technical interviews, practice questions, and track their interview performance.',
      },
      {
        question: 'Who can use Interview AI?',
        answer:
          'Anyone preparing for technical interviews can use Interview AI to improve their knowledge and interview confidence.',
      },
    ],
  },
  {
    category: 'Interview Preparation',
    questions: [
      {
        question: 'How do I start an interview?',
        answer:
          'Navigate to the Interview page, select your interview preferences, and start your practice session.',
      },
      {
        question: 'Can I choose the number of questions?',
        answer:
          'Yes. You can choose 5, 10, 15, or 20 questions when generating a general interview.',
      },
    ],
  },
  {
    category: 'AI-Generated Questions',
    questions: [
      {
        question: 'How are interview questions generated?',
        answer:
          'AI generates interview questions based on your target role, experience, skills, and selected difficulty level.',
      },
      {
        question: 'Can I generate questions based on my career profile?',
        answer:
          'Yes. Interview AI uses your saved career profile details to generate relevant interview questions.',
      },
    ],
  },
  {
    category: 'Documents',
    questions: [
      {
        question: 'Why should I upload documents?',
        answer:
          'You can upload PDF and DOCX documents to get AI-powered answers and generate interview questions based on their content.',
      },
      {
        question: 'Which document formats are supported?',
        answer:
          'Currently, PDF and DOCX files are supported.',
      },
    ],
  },
  {
    category: 'Career Profile',
    questions: [
      {
        question: 'What is My Career Profile?',
        answer:
          'My Career Profile stores your professional details, target roles, experience, and technical skills.',
      },
      {
        question: 'Can I update my career profile?',
        answer:
          'Yes. You can update your career information whenever your skills or career goals change.',
      },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      {
        question: 'How do I log out?',
        answer:
          'Click the Logout option at the bottom of the sidebar to securely end your session.',
      },
      {
        question: 'Is my account protected?',
        answer:
          'The application uses JWT-based authentication to protect access to your account and its features.',
      },
    ],
  },
]

function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const categories = [
    'All',
    ...faqData.map((item) => item.category),
  ]

  const filteredFAQs = faqData
    .filter(
      (item) =>
        activeCategory === 'All' ||
        item.category === activeCategory
    )
    .map((item) => ({
      ...item,
      questions: item.questions.filter(
        (faq) =>
          faq.question
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          faq.answer
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((item) => item.questions.length > 0)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
            <CircleHelp size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-gray-500">
              Find answers to common questions about Interview AI.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your questions..."
          className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              activeCategory === category
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Questions */}
      <div className="space-y-6">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((item) => (
            <section key={item.category} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {item.category}
              </h2>

              <div className="space-y-3">
                {item.questions.map((faq) => (
                <div
                    key={faq.question}
                    className="rounded-xl border border-gray-200 bg-white transition hover:border-purple-200"
                    >
                    <button
                        type="button"
                        onClick={() =>
                        setOpenQuestion(
                            openQuestion === faq.question ? null : faq.question
                        )
                        }
                        className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                        <span className="font-medium text-gray-800">
                        {faq.question}
                        </span>

                        <span className="text-xl font-medium text-purple-600">
                        {openQuestion === faq.question ? '−' : '+'}
                        </span>
                    </button>

                    {openQuestion === faq.question && (
                        <div className="border-t border-gray-100 px-5 py-4">
                        <p className="text-sm leading-6 text-gray-500">
                            {faq.answer}
                        </p>
                        </div>
                    )}
                </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <CircleHelp
              size={32}
              className="mx-auto mb-3 text-gray-400"
            />
            <p className="font-medium text-gray-700">
              No questions found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try another search term or category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FAQPage