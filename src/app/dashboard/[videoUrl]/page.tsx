"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import {
  FileText,
  BarChart2,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LabeledImages = {
  [label: string]: string[]; // Key: label, Value: array of object names
};

type VideoAnalysis = {
  summary?: string;
  transcription?: string;
  detection?: string; // Contains JSON string of labeled object names
  sentiment?: string;
};

type FollowUpQuestion = {
  question: string;
  answer: string;
};

export default function Dashboard() {
  const params = useParams();
  const session = useSession();

  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [labeledImages, setLabeledImages] = useState<LabeledImages>({}); // State to store labeled object names
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpQuestion[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch analysis data on component mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);

        // Get the videoUrl from the URL pathname
        const videoUrl = decodeURIComponent(params.videoUrl as string);

        if (!videoUrl) {
          throw new Error("Video URL is required");
        }

        // Fetch analysis data from the API
        const response = await fetch(
          `/api/getVideoDetails?videoUrl=${videoUrl}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }

        const data = await response.json();
        setAnalysis(data.analysis);

        // Parse the JSON string in the detection field
        if (data.analysis?.detection) {
          const jsonString = data.analysis.detection.replace(
            /```json\n|\n```/g,
            ""
          ); // Remove JSON code block markers
          const parsedData: LabeledImages = JSON.parse(jsonString); // Parse JSON string
          setLabeledImages(parsedData);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.videoUrl]);

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/askQuestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: analysis?.summary,
          question: followUpQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get an answer");
      }

      const data = await response.json();
      const answer = data.answer;

      const newQuestion: FollowUpQuestion = {
        question: followUpQuestion,
        answer,
      };

      setFollowUpHistory([...followUpHistory, newQuestion]);
      setFollowUpQuestion("");
    } catch (error) {
      console.error("Error submitting follow-up question:", error);
      alert(
        "An error occurred while processing your question. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Video Analysis Dashboard</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
          <span>AI-Powered Video Analysis</span>
        </div>
      </div>

      {session && (
        <div className="absolute top-2 right-2">
          <LogoutButton />
        </div>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="detection">Content Detection</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Summary
              </CardTitle>
              <CardDescription>
                Key points and overview of the video content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{analysis?.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcription" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcription
              </CardTitle>
              <CardDescription>
                Complete text transcription of the video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <p className="leading-relaxed">{analysis?.transcription}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detection" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Content Detection
              </CardTitle>
              <CardDescription>
                Analysis of objects detected in the video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{analysis?.detection}</p>
              {/* Render the list of object names */}
              {Object.entries(labeledImages).map(([label, objects]) => (
                <div key={label} className="mt-4 space-y-2">
                  <h3 className="font-semibold text-lg">{label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {objects.map((object, index) => (
                      <div
                        key={index}
                        className="p-4 bg-muted rounded-lg shadow-sm"
                      >
                        <p className="text-sm">{object}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Emotional tone and audience reaction analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{analysis?.sentiment}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ask Follow-up Questions</CardTitle>
          <CardDescription>
            Get more insights about the video content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {followUpHistory.length > 0 && (
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {followUpHistory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="bg-primary text-primary-foreground rounded-full p-2 h-8 w-8 flex items-center justify-center">
                          <span className="text-xs font-bold">You</span>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p>{item.question}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-secondary text-secondary-foreground rounded-full p-2 h-8 w-8 flex items-center justify-center">
                          <span className="text-xs font-bold">AI</span>
                        </div>
                        <div className="bg-secondary/20 p-3 rounded-lg">
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
              <Input
                placeholder="Ask a question about the video..."
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}