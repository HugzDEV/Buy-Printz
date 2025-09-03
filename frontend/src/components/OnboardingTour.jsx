import React, { useState, useEffect } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import { 
  Play, 
  SkipForward, 
  Eye, 
  MousePointer, 
  Palette, 
  Save, 
  ShoppingCart,
  X,
  CheckCircle,
  Sparkles,
  Menu
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'

const OnboardingTour = ({ isFirstTimeUser, onTourComplete, onSkipTour }) => {
  const [runTour, setRunTour] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true)
  const [tourReady, setTourReady] = useState(false)

  useEffect(() => {
    if (isFirstTimeUser) {
      setShowWelcomeDialog(true)
    }
  }, [isFirstTimeUser])

  // Detect device type for responsive tour
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Desktop tour steps
  const desktopTourSteps = [
    {
      target: '.canvas-container',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MousePointer className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Your Creative Canvas</h3>
          <p className="text-gray-600">
            This is where the magic happens! Your banner design lives here.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.sidebar-tools',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Palette className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Design Tools</h3>
          <p className="text-gray-600">
            Add shapes, icons, text, and images to create your perfect banner.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.action-buttons',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Save className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Save & Order</h3>
          <p className="text-gray-600">
            Save your design, preview it, and order when you're ready!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.zoom-controls',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Zoom & Navigate</h3>
          <p className="text-gray-600">
            Zoom in for detail work, zoom out to see the full design.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.element-selection',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-pink-100 rounded-full">
              <MousePointer className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Element Control</h3>
          <p className="text-gray-600">
            Click any element to select, move, resize, or edit it.
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '.final-step',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <img 
                src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                alt="BuyPrintz Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">You're Ready!</h3>
          <p className="text-gray-600">
            Start creating your amazing banner design! 🎨
          </p>
        </div>
      ),
      placement: 'center',
    },
  ]

  // Mobile tour steps
  const mobileTourSteps = [
    {
      target: '.canvas-container',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MousePointer className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Your Creative Canvas</h3>
          <p className="text-gray-600">
            This is where the magic happens! Your banner design lives here.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.mobile-hamburger',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Menu className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Mobile Tools Access</h3>
          <p className="text-gray-600">
            Tap this button to open all your design tools and options on mobile!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.zoom-controls',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Zoom & Navigate</h3>
          <p className="text-gray-600">
            Zoom in for detail work, zoom out to see the full design.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.element-selection',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-pink-100 rounded-full">
              <MousePointer className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Element Control</h3>
          <p className="text-gray-600">
            Click any element to select, move, resize, or edit it.
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '.final-step',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <img 
                src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                alt="BuyPrintz Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">You're Ready!</h3>
          <p className="text-gray-600">
            Start creating your amazing banner design! 🎨
          </p>
        </div>
      ),
      placement: 'center',
    },
  ]

  // Select appropriate tour steps based on device
  const tourSteps = isMobile ? mobileTourSteps : desktopTourSteps

  // Mark tour as ready when steps are available
  useEffect(() => {
    if (tourSteps && tourSteps.length > 0) {
      setTourReady(true)
      console.log('Tour steps initialized:', tourSteps.length, 'steps for', isMobile ? 'mobile' : 'desktop')
    }
  }, [tourSteps, isMobile])

  // Debug: Log tour steps and device type
  useEffect(() => {
    if (runTour) {
      console.log('Tour started on:', isMobile ? 'Mobile' : 'Desktop')
      console.log('Tour steps:', tourSteps)
      console.log('Step targets:', tourSteps.map(step => step.target))
      
      // Check if all target elements exist
      tourSteps.forEach((step, index) => {
        const element = document.querySelector(step.target)
        console.log(`Step ${index} target "${step.target}":`, element ? 'Found' : 'NOT FOUND', element)
      })
    }
  }, [runTour, tourSteps, isMobile])

  const handleTourComplete = (data) => {
    const { status, action, index, step, type } = data
    console.log('Tour callback:', { status, action, index, step, type })
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false)
      onTourComplete()
    }
  }

  const handleStartTour = () => {
    setShowWelcomeDialog(false)
    
    // Wait for tour to be ready
    const waitForTour = () => {
      if (!tourReady) {
        console.log('Waiting for tour to be ready...')
        setTimeout(waitForTour, 100)
        return
      }
      
      console.log('Tour ready, checking targets...')
      
      // Check if target elements exist before starting tour
      const checkTargets = () => {
        const targets = tourSteps.map(step => step.target)
        console.log('Checking targets:', targets)
        
        const missingTargets = targets.filter(target => !document.querySelector(target))
        
        if (missingTargets.length > 0) {
          console.log('Missing targets:', missingTargets)
          // Wait a bit more and try again
          setTimeout(checkTargets, 200)
        } else {
          console.log('All targets found, starting tour')
          setRunTour(true)
        }
      }
      
      checkTargets()
    }
    
    waitForTour()
  }

  const handleSkipTour = () => {
    setShowWelcomeDialog(false)
    onSkipTour()
  }

  if (showWelcomeDialog) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-6 text-center space-y-6 bg-white/95 border-2 border-white/50 shadow-2xl">
                     <div className="flex justify-center">
             <div className="p-4 bg-white rounded-full shadow-lg">
               <img 
                 src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                 alt="BuyPrintz Logo" 
                 className="w-16 h-16 object-contain"
               />
             </div>
           </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-gray-800">Welcome to BuyPrintz! 🎉</h2>
            <p className="text-lg text-gray-700 font-medium">
              Create professional banners in minutes with our powerful design tools.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-base text-gray-600 font-medium">
              Would you like a quick tour to get started?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <GlassButton
                onClick={handleStartTour}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Yes, Show Me Around!
              </GlassButton>
              
              <GlassButton
                onClick={handleSkipTour}
                variant="outline"
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip, I'll Explore
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleTourComplete}
      debug={true}
      disableOverlayClose={true}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          zIndex: 1000,
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(20px)',
        },
        tooltipTitle: {
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: '600',
        },
        tooltipContent: {
          color: '#6b7280',
          fontSize: '14px',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  )
}

export default OnboardingTour
