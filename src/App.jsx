import { useState } from 'react'
import { create } from '@frontify/frontify-finder'
import './App.css'

function App() {
  const [selectedAssets, setSelectedAssets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const openFrontifyFinder = async () => {
  setIsLoading(true)
  setError(null)

  try {
    // Get credentials from environment variables
    const domain = import.meta.env.VITE_FRONTIFY_DOMAIN
    const clientId = import.meta.env.VITE_FRONTIFY_CLIENT_ID

    // Validate credentials
    if (!domain || !clientId) {
      throw new Error('Missing Frontify credentials. Please check your .env.local file.')
    }

    console.log('Creating Frontify Finder instance...')

    // Create the finder instance
    const finderInstance = await create({
      domain: domain,
      clientId: clientId,
    })

    console.log('Finder instance created:', finderInstance)

    // Wait a moment for the iframe to be added to the DOM
    setTimeout(() => {
      // Try to find the iframe in the DOM
      const iframe = document.querySelector('.frontify-finder-iframe') || 
                     document.querySelector('iframe[class*="frontify"]') ||
                     finderInstance.iFrame

      console.log('Found iframe:', iframe)

      if (iframe) {
        // Make sure it's attached to the body
        if (!iframe.parentNode || iframe.parentNode !== document.body) {
          document.body.appendChild(iframe)
        }

        // Force the iframe to be visible with important styles
        iframe.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          border: none !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `

        console.log('Iframe styled and should be visible')
      } else {
        console.error('Could not find iframe in DOM')
      }

      setIsLoading(false)
    }, 500)

    // Try to listen for messages from the iframe
    window.addEventListener('message', (event) => {
      console.log('Received message:', event)
      
      // Check if it's from Frontify
      if (event.data && event.data.type === 'assetsChosen') {
        console.log('Assets chosen:', event.data.assets)
        setSelectedAssets(event.data.assets)
      }
    })

  } catch (err) {
    console.error('Error with Frontify Finder:', err)
    setError(err.message || 'An error occurred')
    setIsLoading(false)
  }
}

  return (
    <div className="app">
      <header className="app-header">
        <h1>Frontify Finder POC</h1>
        <p>Test integration with Frontify Authenticator and Finder</p>
      </header>

      <main className="app-main">
        <button 
          onClick={openFrontifyFinder} 
          disabled={isLoading}
          className="finder-button"
        >
          {isLoading ? 'Opening Finder...' : 'Open Frontify Finder'}
        </button>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {selectedAssets.length > 0 && (
          <section className="assets-section">
            <h2>Selected Assets ({selectedAssets.length})</h2>
            <div className="assets-grid">
              {selectedAssets.map((asset, index) => (
                <div key={asset.id || index} className="asset-card">
                  {asset.previewUrl && (
                    <img 
                      src={asset.previewUrl} 
                      alt={asset.title || 'Asset preview'} 
                      className="asset-image"
                    />
                  )}
                  <div className="asset-info">
                    <h3 className="asset-title">{asset.title || 'Untitled'}</h3>
                    {asset.filename && (
                      <p className="asset-filename">{asset.filename}</p>
                    )}
                    {asset.downloadUrl && (
                      <a 
                        href={asset.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="asset-download"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedAssets.length === 0 && !error && (
          <div className="empty-state">
            <p>No assets selected yet. Click the button above to browse Frontify assets.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App