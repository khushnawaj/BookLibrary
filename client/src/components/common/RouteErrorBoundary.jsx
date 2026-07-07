import { useRouteError } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { LiquidGlassBackground } from '@/components/common/LiquidGlassBackground';
import { Button } from '@/components/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Check if it's a chunk loading failure
  const isChunkError = 
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.stack?.includes('Failed to fetch dynamically imported module') ||
    error?.name === 'ChunkLoadError' ||
    (error?.message && /dynamically imported module/i.test(error.message));

  useEffect(() => {
    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk-error-reload');
      const now = Date.now();
      
      // Auto-reload once if not done in the last 10 seconds
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk-error-reload', now.toString());
        setIsReloading(true);
        window.location.reload();
      }
    }
  }, [isChunkError]);

  const handleManualReload = () => {
    setIsReloading(true);
    window.location.reload();
  };

  const handleCopyError = () => {
    const errorDetails = `Error: ${error?.message || error || 'Unknown Error'}\nStack: ${error?.stack || 'No stack trace available'}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <LiquidGlassBackground className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-8 md:p-12 text-center animate-fade-up relative z-10">
        
        {/* Decorative background glow inside the card */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsating Alert Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20 animate-pulse">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-black text-gradient mb-4">
          {isChunkError ? 'Application Update Detected' : 'Something went amiss'}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
          {isChunkError 
            ? 'A new version of the application has been deployed. We are refreshing your session to fetch the latest improvements.'
            : 'The application encountered an unexpected routing or rendering error. Your data and progress remain safe.'}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            onClick={handleManualReload} 
            loading={isReloading}
            variant="default"
            size="lg"
            className="w-full sm:w-auto shadow-lg hover:shadow-primary/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
            Refresh Application
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Technical Stack Trace Drawer */}
        {error && (
          <div className="border border-border/40 rounded-xl overflow-hidden bg-background/30 backdrop-blur-sm text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-5 py-3 flex items-center justify-between text-sm font-semibold text-muted-foreground hover:bg-secondary/40 transition-colors"
            >
              <span>View Technical Details</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showDetails && (
              <div className="px-5 pb-5 border-t border-border/20 pt-4 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-destructive font-semibold">
                    {error.name || 'Error Details'}
                  </span>
                  <button
                    onClick={handleCopyError}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded bg-secondary/50 border border-border/30"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span className="text-success font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy trace</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono bg-card/85 p-3 rounded-lg overflow-x-auto text-foreground border border-border/30 max-h-48 scrollbar-thin">
                  {error.message || String(error)}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </LiquidGlassBackground>
  );
}
