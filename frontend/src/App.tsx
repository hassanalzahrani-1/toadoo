function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">
          🐸 Toadoo
        </h1>
        <p className="text-xl text-muted-foreground">
          Your todo app with authentication
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Get Started
          </button>
          <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
