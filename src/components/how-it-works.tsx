import { UploadIcon, Cpu, FileText, Download } from "lucide-react"
// import Image from "next/image"

export function HowItWorks() {
  const steps = [
    {
      icon: <UploadIcon className="h-10 w-10 text-primary" />,
      title: "Upload Your Video",
      description: "Upload your video file (up to 10 minutes in length) to our secure platform.",
    },
    {
      icon: <Cpu className="h-10 w-10 text-primary" />,
      title: "AI Processing",
      description:
        "Our advanced AI analyzes your video, extracting spoken words, on-screen text, and identifying key topics.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Review Results",
      description: "View the extracted text, topics, and insights in an easy-to-read format with timestamps.",
    },
    {
      icon: <Download className="h-10 w-10 text-primary" />,
      title: "Export & Share",
      description: "Download the results as a PDF or text file, or share them directly with your team.",
    },
  ]

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Our video analysis process is simple, fast, and powerful. Here is how it works:
        </p>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2 hidden md:block" />

        <div className="space-y-12 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                <div className={`mb-8 md:mb-0 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="bg-card rounded-lg p-8 shadow-sm relative">
                    {/* Circle on the timeline */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary hidden md:block"
                      style={{ [index % 2 === 0 ? "right" : "left"]: "-3.5rem" }}
                    />

                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="p-3 bg-primary/10 rounded-full mb-4 inline-flex">{step.icon}</div>
                      <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                    {/* <Image
                      src='./file.svg'
                      alt={`Step ${index + 1}: ${step.title}`}
                      fill
                      className="object-cover w-full h-full"
                    /> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

