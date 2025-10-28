'use client';

import { motion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import {
  Download,
  Calendar,
  Mail,
  Globe,
  School,
  Users,
  GraduationCap,
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  CheckCircle2,
  Award,
  BarChart3,
  Lightbulb,
  Heart,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  FileText,
} from 'lucide-react';

export default function InvestorsPage() {
  const { t } = useI18n();

  const problemPoints = [
    {
      icon: School,
      title: t('investorDisconnectedSystems'),
      description: t('investorDisconnectedSystemsDesc'),
    },
    {
      icon: DollarSign,
      title: t('investorInefficientFee'),
      description: t('investorInefficientFeeDesc'),
    },
    {
      icon: Brain,
      title: t('investorNonAdaptiveLearning'),
      description: t('investorNonAdaptiveLearningDesc'),
    },
    {
      icon: MessageCircle,
      title: t('investorLimitedCommunication'),
      description: t('investorLimitedCommunicationDesc'),
    },
  ];

  const solutionPillars = [
    {
      icon: School,
      title: t('investorForSchools'),
      description: t('investorForSchoolsDesc'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: GraduationCap,
      title: t('investorForTeachers'),
      description: t('investorForTeachersDesc'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Users,
      title: t('investorForParents'),
      description: t('investorForParentsDesc'),
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Brain,
      title: t('investorPoweredByAI'),
      description: t('investorPoweredByAIDesc'),
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const roadmapPhases = [
    {
      phase: t('investorPhaseIdeaRD'),
      timeframe: t('investorPhaseIdeaRDTime'),
      milestone: t('investorPhaseIdeaRDMilestone'),
      progress: 100,
      status: 'completed',
    },
    {
      phase: t('investorPhasePilot'),
      timeframe: t('investorPhasePilotTime'),
      milestone: t('investorPhasePilotMilestone'),
      progress: 75,
      status: 'in-progress',
    },
    {
      phase: t('investorPhaseEarlyExpansion'),
      timeframe: t('investorPhaseEarlyExpansionTime'),
      milestone: t('investorPhaseEarlyExpansionMilestone'),
      progress: 40,
      status: 'in-progress',
    },
    {
      phase: t('investorPhasePublicBeta'),
      timeframe: t('investorPhasePublicBetaTime'),
      milestone: t('investorPhasePublicBetaMilestone'),
      progress: 10,
      status: 'planned',
    },
    {
      phase: t('investorPhaseFreelanceGrowth'),
      timeframe: t('investorPhaseFreelanceGrowthTime'),
      milestone: t('investorPhaseFreelanceGrowthMilestone'),
      progress: 0,
      status: 'planned',
    },
  ];

  const marketStats = [
    {
      value: '$404B',
      label: t('investorMarketStat1'),
    },
    {
      value: '12M',
      label: t('investorMarketStat2'),
    },
    {
      value: '85%',
      label: t('investorMarketStat3'),
    },
  ];

  const businessModels = [
    {
      icon: School,
      title: t('investorModelSchools'),
      description: t('investorModelSchoolsDesc'),
      pricing: t('investorModelSchoolsPricing'),
    },
    {
      icon: GraduationCap,
      title: t('investorModelFreelance'),
      description: t('investorModelFreelanceDesc'),
      pricing: t('investorModelFreelancePricing'),
    },
    {
      icon: Users,
      title: t('investorModelParents'),
      description: t('investorModelParentsDesc'),
      pricing: t('investorModelParentsPricing'),
    },
  ];

  const tractionMetrics = [
    {
      icon: Target,
      value: '2',
      label: t('investorSchoolsOnboarded'),
      sublabel: t('investorDecProjected'),
    },
    {
      icon: Users,
      value: '700+',
      label: t('investorStudentsTarget'),
      sublabel: t('investorJuneProjected'),
    },
    {
      icon: TrendingUp,
      value: '80%',
      label: t('investorParentEngagement'),
      sublabel: t('investorProjected'),
    },
    {
      icon: Award,
      value: '4.9',
      label: t('investorPilotSatisfaction'),
      sublabel: t('investorEarlyFeedback'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-3xl font-bold" style={{
                background: 'linear-gradient(135deg, #0B5FFF 0%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                tuto.
              </div>
              <Badge variant="primary" className="hidden sm:flex gap-1">
                <Zap className="w-3 h-3" />
                {t('investorForInvestors')}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Button size="sm" variant="outline" className="gap-2 rounded-xl hidden sm:flex">
                <Download className="w-4 h-4" />
                {t('investorDeck')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-[#0B5FFF]"
              style={{ fontSize: '12rem' }}
            >
              tuto.
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="mb-6 bg-[#0B5FFF]/10 text-[#0B5FFF] border-[#0B5FFF]/20">
                  {t('investorPreSeedOpportunity')}
                </Badge>
                <h1 className="mb-6 text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {t('investorHeroTitle')}
                </h1>
                <p className="mb-8 text-lg text-gray-600 max-w-xl">
                  {t('investorHeroDescription')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 rounded-xl gap-2">
                    <Download className="w-5 h-5" />
                    {t('investorDownloadDeck')}
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('investorBookChat')}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B5FFF]/30 to-purple-500/30 rounded-3xl blur-3xl" />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1579864795584-092b04e14e67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHZpc2lvbiUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzYxMDI4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Vision"
                  className="relative w-full h-auto rounded-3xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. The Problem & Opportunity */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorProblemTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto mb-8 text-lg">
                {t('investorProblemDescription')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {problemPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                      <point.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">{point.title}</h4>
                    <p className="text-sm text-gray-600">{point.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. The Solution */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorSolutionTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                {t('investorSolutionDescription')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759820941220-fed6a1010146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5JTIwZGV2aWNlfGVufDF8fHx8MTc2MTAyODk1NHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Product"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </motion.div>

              <div className="space-y-6">
                {solutionPillars.map((pillar, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
                      <div className="flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <pillar.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="mb-2 text-lg font-semibold text-gray-900">{pillar.title}</h4>
                          <p className="text-sm text-gray-600">{pillar.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Roadmap */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorRoadmapTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                {t('investorRoadmapDescription')}
              </p>
            </motion.div>

            <div className="space-y-8">
              {roadmapPhases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{phase.phase}</h4>
                          {phase.status === 'completed' && (
                            <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t('investorCompleted')}
                            </Badge>
                          )}
                          {phase.status === 'in-progress' && (
                            <Badge variant="primary" className="bg-blue-100 text-blue-700 border-blue-200">
                              <Zap className="w-3 h-3 mr-1" />
                              {t('investorInProgress')}
                            </Badge>
                          )}
                          {phase.status === 'planned' && (
                            <Badge variant="gray">{t('investorPlanned')}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{phase.timeframe}</p>
                        <p className="text-sm text-gray-900">{phase.milestone}</p>
                      </div>
                      <div className="lg:w-64">
                        <div className="flex items-center gap-3">
                          <Progress value={phase.progress} className="flex-1" />
                          <span className="text-sm text-gray-600 min-w-[3rem]">{phase.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Market Potential */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorMarketTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                {t('investorMarketDescription')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1742415105376-43d3a5fd03fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGdsb2JhbCUyMG9wcG9ydHVuaXR5fGVufDF8fHx8MTc2MTAyODk1NHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Global Market"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </motion.div>

              <div className="space-y-6">
                {marketStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-[#0B5FFF]/5 to-purple-500/5 border-[#0B5FFF]/10">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-[#0B5FFF]">{stat.value}</div>
                        <p className="text-gray-900 font-medium">{stat.label}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pt-6"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                    <div className="flex items-start gap-3">
                      <Globe className="w-6 h-6 text-[#0B5FFF] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="mb-2 text-lg font-semibold text-gray-900">
                          {t('investorMarketSEAFocus')}
                        </h4>
                        <p className="text-sm text-gray-600">{t('investorMarketSEAFocusDesc')}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Business Model */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorBusinessModelTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                {t('investorBusinessModelDescription')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {businessModels.map((model, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-xl transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B5FFF] to-purple-500 flex items-center justify-center mb-4">
                      <model.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">{model.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                    <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                      {model.pricing}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-[#0B5FFF]/5 to-purple-500/5 border-[#0B5FFF]/10">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 text-[#0B5FFF] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">
                      {t('investorLongTermVision')}
                    </h4>
                    <p className="text-gray-600">{t('investorLongTermVisionDesc')}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* 7. Traction */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorTractionTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                {t('investorTractionDescription')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tractionMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B5FFF]/10 flex items-center justify-center mx-auto mb-4">
                      <metric.icon className="w-6 h-6 text-[#0B5FFF]" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-gray-900">{metric.value}</div>
                    <p className="text-sm text-gray-900 font-medium mb-1">{metric.label}</p>
                    <p className="text-xs text-gray-600">{metric.sublabel}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-[#0B5FFF]/20">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-[#0B5FFF]" />
                      <h4 className="font-semibold text-gray-900">{t('investorPilotTestimonial')}</h4>
                    </div>
                    <blockquote className="italic text-gray-900 mb-4">
                      "{t('investorTestimonialQuote')}"
                    </blockquote>
                    <p className="text-sm text-gray-600">— {t('investorTestimonialAuthor')}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5 text-[#0B5FFF]" />
                      <h4 className="font-semibold text-gray-900">{t('investorPartnerSchools')}</h4>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="gray" className="mr-2">
                        {t('investorApolloEnglish')}
                      </Badge>
                      <Badge variant="gray" className="mr-2">
                        {t('investorPartnerSchool2')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* 8. Team */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-gray-900">
                {t('investorTeamTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                {t('investorTeamDescription')}
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-200/50 mb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0B5FFF] to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl font-bold text-white">TT</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">Tarun Tageja</h3>
                      <p className="text-[#0B5FFF] font-medium mb-3">{t('investorFounderCEO')}</p>
                      <p className="text-gray-600 mb-4">{t('investorFounderBio')}</p>
                      <div className="flex gap-2 justify-center md:justify-start">
                        <Badge variant="gray">{t('investorEducation')}</Badge>
                        <Badge variant="gray">{t('investorManagement')}</Badge>
                        <Badge variant="gray">{t('investorProduct')}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-[#0B5FFF]/5 to-purple-500/5 border-[#0B5FFF]/10">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-[#0B5FFF] mx-auto mb-3" />
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">
                      {t('investorAdvisoryBoard')}
                    </h4>
                    <p className="text-gray-600">{t('investorAdvisoryBoardDesc')}</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 9. Investor Invitation */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-12 bg-gradient-to-br from-[#0B5FFF] to-purple-500 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white" />
                </div>
                <div className="relative z-10">
                  <h2 className="mb-6 text-3xl lg:text-4xl font-bold text-white">
                    {t('investorInvitationTitle')}
                  </h2>
                  <p className="mb-8 text-white/90 max-w-2xl mx-auto text-lg">
                    {t('investorInvitationDescription')}
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-xl gap-2 bg-white text-[#0B5FFF] hover:bg-gray-100"
                    >
                      <FileText className="w-5 h-5" />
                      {t('investorRequestDeck')}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl border-white text-white hover:bg-white/10 gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      {t('investorScheduleCall')}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl border-white text-white hover:bg-white/10 gap-2"
                    >
                      <Globe className="w-5 h-5" />
                      {t('investorVisitWebsite')}
                    </Button>
                  </div>

                  <div className="pt-8 border-t border-white/20">
                    <h4 className="mb-4 font-semibold text-white">{t('investorResources')}</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <Download className="w-4 h-4 mr-2" />
                        {t('investorOnePager')}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {t('investorFinancials')}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('investorWhitepaper')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl font-bold mb-4" style={{
                background: 'linear-gradient(135deg, #0B5FFF 0%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                tuto.
              </div>
              <p className="text-gray-600 mb-4">{t('investorFooterTagline')}</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">{t('investorContact')}</h4>
              <div className="space-y-2">
                <a
                  href="mailto:investor@tuto.education"
                  className="flex items-center gap-2 text-gray-600 hover:text-[#0B5FFF] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  investor@tuto.education
                </a>
                <a
                  href="https://tuto.education/investors"
                  className="flex items-center gap-2 text-gray-600 hover:text-[#0B5FFF] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  tuto.education/investors
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">{t('investorConnect')}</h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0B5FFF] hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0B5FFF] hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0B5FFF] hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0B5FFF] hover:text-white transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2025 tuto. {t('investorAllRights')}</p>
            <p className="text-gray-600 text-sm">{t('investorPreSeedPhase')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
