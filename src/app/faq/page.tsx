'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  items: FAQItem[]
}

export default function FAQPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const faqData: FAQSection[] = [
    {
      title: "General Questions",
      items: [
        {
          question: "What is Art3mis Oracle?",
          answer: "Art3mis Oracle is a Web3 AI-powered mystical art platform built on the Aptos blockchain, combining ancient divination practices like tarot, horoscopes, omikuji, and Chinese fortune-telling with the latest AI and blockchain technology."
        },
        {
          question: "What makes Art3mis Oracle unique?",
          answer: "We offer a one-stop mystical art experience powered by creative digital art, personalized AI-driven readings, and blockchain integration. Users can mint their readings as NFTs, engage in co-creation, and explore a growing library of divination arts—all in a seamless Web3 environment."
        },
        {
          question: "Who is Art3mis Oracle for?",
          answer: "Art3mis Oracle is for everyone! Whether you're a mystical arts enthusiast, curious about tarot, or looking for an approachable way to explore Web3, our platform is designed to welcome users from all backgrounds."
        }
      ]
    },
    {
      title: "Features and Functionality",
      items: [
        {
          question: "What divination practices are available?",
          answer: "Currently, we support tarot readings, with plans to expand into horoscopes, omikuji, Chinese fortune-telling, and other mystical arts. Stay tuned for updates as we add more features!"
        },
        {
          question: "Can I mint my reading as an NFT?",
          answer: "Yes! Each reading can be minted as a unique NFT, allowing you to own and collect your mystical experiences on the blockchain."
        }
      ]
    },
    {
      title: "Technology",
      items: [
        {
          question: "What blockchain does Art3mis Oracle use?",
          answer: "Art3mis Oracle is built on the Aptos blockchain, known for its scalability, security, and developer-friendly ecosystem."
        },
        {
          question: "How does AI power the platform?",
          answer: "We use advanced AI models to generate personalized readings based on your input, delivering unique interpretations that enhance your mystical journey."
        }
      ]
    },
    {
      title: "Join the fun",
      items: [
        {
          question: "How do I sign up?",
          answer: "Simply connect your Aptos-compatible wallet or sign in with your Google Account to the platform to get started. No prior blockchain experience is required!"
        },
        {
          question: "What wallet can i use to sign up?",
          answer: "Aptos-compatible wallets like Nightly Wallet, Petra Wallet, Martian Wallet, and others can be used to sign up for Art3mis Oracle. If you don't have a wallet yet, you can create one during the sign-up process."
        },
        {
          question: "Do I need to pay for readings?",
          answer: "Art3mis Oracle offers both free and paid readings. Premium readings and NFTs are available at a small fee, with subscriptions planned for daily readings and other exclusive content."
        }
      ]
    }
  ]

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="min-h-screen text-white p-4 pt-10 lg:pt-20 lg:px-10 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-amber-100/80">
            Discover the mysteries of Art3mis Oracle
          </p>
        </div>

        <div className="space-y-6">
          {faqData.map((section) => (
            <div
              key={section.title}
              className="rounded-lg overflow-hidden  backdrop-blur-sm border border-purple-500/20"
            >
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-purple-800/30 hover:bg-purple-800/40 transition-colors"
              >
                <h2 className="text-xl font-semibold text-amber-200">
                  {section.title}
                </h2>
                 <div className={`w-0 h-0 border-l-[2px] border-r-[2px] border-t-[6px] sm:border-l-[2px] sm:border-r-[2px] sm:border-t-[8px] md:border-l-[3px] md:border-r-[3px] md:border-t-[10px] lg:border-l-[4px] lg:border-r-[4px] lg:border-t-[12px] border-l-transparent border-r-transparent border-t-[#f4a07e] group-data-[state=open]:border-t-[#8d5839] bg-transparent after:content-[''] after:absolute after:top-[-1px] after:left-1/2 after:-translate-x-1/2 after:w-[3px] after:h-[1px] after:bg-transparent transition-transform ${
                    openSections[section.title] ? 'rotate-180' : ''
                  }`}></div>
              </button>

              {openSections[section.title] && (
                <div className="px-6 py-4 space-y-4">
                  {section.items.map((item) => (
                    <div key={item.question} className="border-b border-purple-500/20 last:border-0">
                        <h3 className="text-lg text-amber-100 pr-4">{item.question}</h3>
                        <p className="pb-4 text-purple-100/80 leading-relaxed">
                          {item.answer}
                        </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-purple-200/60">
            For feedback or further questions? Join our{' '}
            <a href="#" className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/30">
              Discord community
            </a>
            {' '}for more support.
          </p>
        </div>
      </div>
    </div>
  )
}

