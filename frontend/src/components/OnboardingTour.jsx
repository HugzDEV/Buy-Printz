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

const OnboardingTour = ({ isFirstTimeUser, showTour, onTourComplete, onSkipTour }) => {
  const [runTour, setRunTour] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)
  const [tourReady, setTourReady] = useState(false)

  useEffect(() => {
    if (isFirstTimeUser && showTour) {
      setShowWelcomeDialog(true)
    } else {
      setShowWelcomeDialog(false)
    }
  }, [isFirstTimeUser, showTour])

  // Detect device type for responsive tour
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Desktop tour steps
  const desktopTourSteps = [
    {
      target: '.final-step',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MousePointer className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Welcome to BuyPrintz!</h3>
          <p className="text-gray-600">
            This is your professional banner design studio. Let's take a quick tour!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
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
            Save your design, create templates, and order when you're ready!
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
      target: '.mobile-hamburger',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Menu className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Design Tools</h3>
          <p className="text-gray-600">
            Click here to access all design tools - text, shapes, icons, and more!
          </p>
        </div>
      ),
      placement: 'right',
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
      target: '.final-step',
      content: (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MousePointer className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Welcome to BuyPrintz!</h3>
          <p className="text-gray-600">
            This is your professional banner design studio. Let's take a quick tour!
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
  const [tourSteps, setTourSteps] = useState([])
  
  useEffect(() => {
    const baseSteps = isMobile ? mobileTourSteps : desktopTourSteps
    setTourSteps(baseSteps)
  }, [isMobile])

  // Mark tour as ready when steps are available
  useEffect(() => {
    if (tourSteps && tourSteps.length > 0) {
      setTourReady(true)
    }
  }, [tourSteps, isMobile])

  const handleTourComplete = (data) => {
    const { status } = data
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false)
      // Clear the fromLandingPage flag
      sessionStorage.removeItem('fromLandingPage')
      onTourComplete()
    }
  }

  const handleStartTour = () => {
    setShowWelcomeDialog(false)
    
    // Wait for tour to be ready with timeout
    let attempts = 0
    const maxAttempts = 100 // 10 seconds max wait
    
    const waitForTour = () => {
      attempts++
      
      if (attempts >= maxAttempts) {
        setRunTour(true)
        return
      }
      
      if (!tourReady) {
        setTimeout(waitForTour, 100)
        return
      }
      
      // Check if target elements exist before starting tour
      const checkTargets = () => {
        const targets = tourSteps.map(step => step.target)
        const missingTargets = targets.filter(target => !document.querySelector(target))
        
        if (missingTargets.length > 0) {
          // Special handling for mobile hamburger if it's the only missing target
          if (missingTargets.length === 1 && missingTargets[0] === '.mobile-hamburger' && isMobile) {
            // Try to find the button by alternative means
            const alternativeSelectors = [
              'button[class*="hamburger"]',
              'button[class*="mobile"]',
              'button:has(svg[data-lucide="menu"])',
              'button:has(.lucide-menu)',
              'button:has([data-lucide="menu"])'
            ]
            
            let foundButton = null
            for (const selector of alternativeSelectors) {
              try {
                const element = document.querySelector(selector)
                if (element) {
                  foundButton = element
                  break
                }
              } catch (e) {
                // Selector failed, continue to next
              }
            }
            
            if (foundButton) {
              // Add the mobile-hamburger class to the found button
              foundButton.classList.add('mobile-hamburger')
              
              // Wait a bit for the class to be applied, then retry
              setTimeout(() => {
                checkTargets()
              }, 100)
              return
            }
          }
          
          // Fallback: Create a working tour with available targets
          const workingSteps = tourSteps.filter(step => document.querySelector(step.target))
          
          if (workingSteps.length > 0) {
            // Update tourSteps to only include working targets
            setTourSteps(workingSteps)
            setRunTour(true)
            return
          }
          
          // Wait a bit more and try again
          setTimeout(checkTargets, 200)
        } else {
          setRunTour(true)
        }
      }
      
      // Add a small delay to ensure DOM is fully rendered
      setTimeout(checkTargets, 100)
    }
    
    waitForTour()
  }

  const handleSkipTour = () => {
    setShowWelcomeDialog(false)
    // Clear the fromLandingPage flag
    sessionStorage.removeItem('fromLandingPage')
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
      debug={false}
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
