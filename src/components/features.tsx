import { FileText, Search, Clock, Layers, Zap, Shield } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Text Extraction",
      description: "Extract spoken words, on-screen text, and captions from your videos automatically.",
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Content Analysis",
      description: "Identify key topics, entities, and sentiment in your video content.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Time Markers",
      description: "Get timestamps for important moments and topics in your videos.",
    },
    {
      icon: <Layers className="h-8 w-8 text-primary" />,
      title: "Multiple Formats",
      description: "Support for all major video formats including MP4, MOV, AVI, and more.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Fast Processing",
      description: "Get results in minutes, not hours, thanks to our optimized AI pipeline.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Processing",
      description: "Your videos are processed securely and never shared with third parties.",
    },
  ]

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful Features</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Our AI-powered video analysis tool offers a range of features to help you extract valuable insights from your
          video content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

