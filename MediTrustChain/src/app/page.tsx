"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ThemeToggleClientWrapper from '@/components/theme-toggle-client-wrapper';
import { ShieldCheck, ArrowRight, CheckCircle2, Eye, Users, Truck, Sparkles, ChevronRight, Pill, Factory, Building2, Globe, Lock, Zap, Award, Star, Quote, Play, BarChart3, Clock, Shield, FileCheck, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-xl border-b border-border/40 fixed w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">MediTrustChain</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50 hidden md:block">
              About
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50 hidden md:block">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50 hidden lg:block">
              How It Works
            </Link>
            <ThemeToggleClientWrapper />
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25">
              <Link href="/login" className="flex items-center gap-1">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-background to-teal-50/50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
          <div className="absolute top-20 left-[5%] w-[500px] h-[500px] bg-emerald-400/50 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-[5%] w-[600px] h-[600px] bg-teal-400/40 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/15 rounded-full blur-[200px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          {/* Floating Elements */}
          <div className="absolute top-32 right-[15%] hidden lg:block">
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verified Batch</p>
                  <p className="text-sm font-semibold text-emerald-600">BCH-2024-001</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-32 left-[10%] hidden lg:block">
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="p-4 bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Chains</p>
                  <p className="text-sm font-semibold">12,847 Shipments</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="container mx-auto relative px-4 md:px-6 py-20 max-w-7xl">
            <motion.div 
              className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto"
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-5 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <Sparkles className="h-4 w-4" />
                  Blockchain-Powered Healthcare Security
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
              >
                Secure Your
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  Pharma Supply Chain
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                variants={fadeInUp}
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed"
              >
                Combat counterfeit drugs and ensure patient safety with immutable blockchain records. 
                Track every medicine from manufacturer to patient with complete transparency.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 mt-6"
              >
                <Button asChild size="lg" className="h-14 px-10 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
                  <Link href="/login" className="flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-2 hover:bg-muted/50 hover:scale-105 transition-all duration-300">
                  <Link href="/about" className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Learn More
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-4">
                <Zap className="h-4 w-4" />
                Simple Process
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Track pharmaceuticals through every step with blockchain verification
              </p>
            </motion.div>

            <div className="grid md:grid-cols-6 gap-6 lg:gap-8 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-20 left-[10%] right-[10%] h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full" />
              
              {[
                { icon: Factory, title: "Manufacturing", desc: "Drug created and registered on blockchain with unique identifier" },
                { icon: FileCheck, title: "Regulator", desc: "Compliance verification and quality assurance checks" },
                { icon: Building2, title: "Distribution", desc: "Tracked through authorized distributor channels securely" },
                { icon: Truck, title: "Logistics", desc: "Real-time temperature and location monitoring" },
                { icon: Store, title: "Pharmacy", desc: "Authenticated dispensing with complete chain of custody" },
                { icon: Pill, title: "Patient", desc: "Verify authenticity instantly before use" },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                >
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 mb-8">
                    <step.icon className="h-10 w-10" />
                    <span className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground text-sm font-bold border-2 border-emerald-500 shadow-lg">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-4">
                <Star className="h-4 w-4" />
                Why Choose Us
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Powerful Features
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Enterprise-grade security and transparency for the pharmaceutical industry
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Immutable Records",
                  description: "Every transaction is permanently recorded on the blockchain, creating an audit trail that cannot be tampered with.",
                  color: "from-emerald-500 to-green-600"
                },
                {
                  icon: Eye,
                  title: "Full Transparency",
                  description: "Track your medicine's complete journey from manufacturer to pharmacy. Verify authenticity instantly.",
                  color: "from-teal-500 to-cyan-600"
                },
                {
                  icon: Users,
                  title: "Multi-Stakeholder",
                  description: "Connect manufacturers, distributors, pharmacies, regulators, and patients in one trusted platform.",
                  color: "from-blue-500 to-indigo-600"
                },
                {
                  icon: Zap,
                  title: "Real-time Tracking",
                  description: "Monitor shipments in real-time with instant alerts for temperature deviations or route changes.",
                  color: "from-orange-500 to-amber-600"
                },
                {
                  icon: Lock,
                  title: "Advanced Security",
                  description: "Bank-grade encryption and multi-factor authentication protect all your sensitive data.",
                  color: "from-purple-500 to-pink-600"
                },
                {
                  icon: Globe,
                  title: "Global Compliance",
                  description: "Meet FDA, EU MDR, and international regulatory requirements with built-in compliance tools.",
                  color: "from-rose-500 to-red-600"
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative overflow-hidden rounded-3xl border bg-card p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div 
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-12 md:p-20 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Ready to Secure Your Supply Chain?
                </h2>
                <p className="text-xl md:text-2xl text-white/80 mb-10">
                  Join hundreds of pharmaceutical companies already protecting patients and combating counterfeits.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="h-14 px-10 text-lg bg-white text-emerald-700 hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-300">
                    <Link href="/login" className="flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300">
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-16 max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">MediTrustChain</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                Securing pharmaceutical supply chains with blockchain technology. Protecting patients worldwide.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </Link>
                <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </Link>
                <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 MediTrustChain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
