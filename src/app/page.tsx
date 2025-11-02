'use client'

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  ArrowRight,
  Shield,
  Coins,
  TrendingUp,
  Building2,
  Gem,
  Home,
  Wallet,
  FileCheck,
  Users,
  Lock,
  Globe
} from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useAccount } from "wagmi";

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-black to-gray-900 text-white py-24 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Built on Base • Powered by Reown</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Own Real Estate,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                One Token at a Time
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Assetra bridges real-world assets to the blockchain.
              Tokenize real estate, commodities, and collectibles. Trade fractional shares.
              Earn passive income from verified, on-chain assets.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isConnected ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    Explore Assets
                  </Link>
                </>
              ) : (
                <>
                  <div className="transform hover:scale-105 transition-all">
                    <ConnectButton />
                  </div>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">$0M+</div>
                <div className="text-white/60 text-sm">Assets Tokenized</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">0+</div>
                <div className="text-white/60 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">4</div>
                <div className="text-white/60 text-sm">Blockchains</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Asset Categories */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tokenize Any Asset Class</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From real estate to rare collectibles, bring your assets on-chain with full compliance and security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-black hover:shadow-xl transition-all">
              <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <Home className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real Estate</h3>
              <p className="text-gray-600 mb-4">
                Tokenize residential, commercial properties, or land. Enable fractional ownership and global investment.
              </p>
              <div className="text-sm font-medium text-blue-600">Coming Soon →</div>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-black hover:shadow-xl transition-all">
              <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <Gem className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Collectibles</h3>
              <p className="text-gray-600 mb-4">
                Art, rare items, and luxury goods. Verify authenticity and enable secure trading on-chain.
              </p>
              <div className="text-sm font-medium text-purple-600">Coming Soon →</div>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-black hover:shadow-xl transition-all">
              <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Commodities</h3>
              <p className="text-gray-600 mb-4">
                Gold, silver, oil, and other physical commodities. Trade tokenized ownership with instant settlement.
              </p>
              <div className="text-sm font-medium text-green-600">Coming Soon →</div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Assetra Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and compliant tokenization in four steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Connect Wallet</h3>
              <p className="text-sm text-gray-600">
                Connect your wallet using Reown AppKit. Supports 600+ wallets.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Submit Asset</h3>
              <p className="text-sm text-gray-600">
                Upload asset details, documents, and proof of ownership.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Verification</h3>
              <p className="text-sm text-gray-600">
                Our oracle system verifies authenticity and compliance.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                4
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Coins className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2">Trade & Earn</h3>
              <p className="text-sm text-gray-600">
                Mint tokens, list on marketplace, or fractionalize for trading.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Assetra?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with security, compliance, and user experience at the core.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <Shield className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-3">Secure & Verified</h3>
              <p className="text-gray-600">
                Every asset is verified through our decentralized oracle network. Documents stored on IPFS with blockchain proof.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <Users className="h-12 w-12 mb-4 text-purple-600" />
              <h3 className="text-xl font-bold mb-3">Fractional Ownership</h3>
              <p className="text-gray-600">
                Split high-value assets into tradable shares. Enable global access to premium investments.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <Lock className="h-12 w-12 mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-3">KYC/AML Compliant</h3>
              <p className="text-gray-600">
                Built-in compliance layer ensures regulatory adherence. Whitelist accredited investors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <TrendingUp className="h-12 w-12 mb-4 text-orange-600" />
              <h3 className="text-xl font-bold mb-3">Built on Base</h3>
              <p className="text-gray-600">
                Lightning-fast transactions with minimal fees. Powered by Ethereum's security and Coinbase's infrastructure.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <Coins className="h-12 w-12 mb-4 text-yellow-600" />
              <h3 className="text-xl font-bold mb-3">Passive Income</h3>
              <p className="text-gray-600">
                Earn revenue from rental income, dividends, or asset appreciation. Automatic distribution to token holders.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <Globe className="h-12 w-12 mb-4 text-indigo-600" />
              <h3 className="text-xl font-bold mb-3">Multi-Chain Support</h3>
              <p className="text-gray-600">
                Trade on Base, Ethereum, and more. Cross-chain bridge for maximum liquidity.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-black to-gray-900 text-white py-20">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Tokenize Your Assets?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join the future of asset ownership. Connect your wallet to get started.
          </p>

          {isConnected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tokenize"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Tokenize Asset
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 font-semibold hover:bg-white/10 transition-all"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="transform hover:scale-105 transition-all inline-block">
              <ConnectButton />
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
