import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Apple, 
  Play, 
  Shield, 
  Bell, 
  BookOpen, 
  Award, 
  Heart, 
  CheckCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/app';
import appIcon from '/appstore-icon.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const features = [
  {
    icon: BookOpen,
    title: 'Complete Food Library',
    description: 'Track 100+ foods with age-appropriate serving guides and prep tips for each stage.',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: Shield,
    title: 'Allergen Tracking',
    description: 'Safely introduce the top 9 allergens with guided protocols and reaction logging.',
    color: 'bg-success/10 text-success'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a feeding with customizable daily reminders and milestone alerts.',
    color: 'bg-warning/10 text-warning'
  },
  {
    icon: Award,
    title: 'Celebrate Milestones',
    description: 'Unlock achievements as your baby explores new foods and flavors.',
    color: 'bg-accent/10 text-accent'
  }
];

const steps = [
  { number: '1', title: 'Create Profile', description: "Add your baby's info to get personalized recommendations" },
  { number: '2', title: 'Log Foods', description: 'Track each new food introduction with photos and notes' },
  { number: '3', title: 'Monitor Progress', description: 'Watch your baby safely expand their palate' }
];

const testimonials = [
  {
    quote: "TinyPalate made introducing allergens so much less stressful. Love the reaction tracking!",
    author: "Sarah M.",
    role: "Mom of 8-month-old"
  },
  {
    quote: "The food library is amazing. I finally feel confident knowing what to feed my baby.",
    author: "Michael T.",
    role: "First-time dad"
  },
  {
    quote: "Being able to share reports with our pediatrician has been incredibly helpful.",
    author: "Emily R.",
    role: "Mom of twins"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={appIcon} alt="TinyPalate" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg">{APP_CONFIG.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Trusted by 10,000+ parents
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Track Your Baby's
              <span className="block text-primary">Food Journey</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              {APP_CONFIG.description}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-6">
                <Apple className="w-5 h-5" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-12 px-6">
                <Play className="w-5 h-5" />
                Get on Android
              </Button>
            </motion.div>
            
            <motion.p variants={fadeInUp} className="text-sm text-muted-foreground mt-4">
              Free to download • No credit card required
            </motion.p>
          </motion.div>

          {/* App Preview */}
          <motion.div 
            className="mt-12 md:mt-16 flex justify-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <img 
                src={appIcon} 
                alt="TinyPalate App" 
                className="w-48 h-48 md:w-64 md:h-64 rounded-3xl shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From first bites to favorite foods, TinyPalate guides you every step of the way.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Simple as 1-2-3
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
              Get started in minutes, not hours.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Parents
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
              Join thousands of families on their feeding journey.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Baby's Food Adventure
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Download TinyPalate today and join the community of confident parents raising adventurous eaters.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-lg">
                <Apple className="w-5 h-5" />
                App Store
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-14 px-8 text-lg">
                <Play className="w-5 h-5" />
                Play Store
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-success" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-success" />
                No ads
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-success" />
                Secure & private
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={appIcon} alt="TinyPalate" className="w-6 h-6 rounded-md" />
              <span className="font-semibold">{APP_CONFIG.name}</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 {APP_CONFIG.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
