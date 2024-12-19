import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface FeedbackData {
  id: string;
  timestamp: number;
  rating: number;
  readingSatisfaction: number;
  willingToPay: string;
  useMainnet: boolean;
  openFeedback: string;
}

export function FeedbackForm() {
  const [rating, setRating] = useState<number>(5);
  const [readingSatisfaction, setReadingSatisfaction] = useState<number>(5);
  const [willingToPay, setWillingToPay] = useState<string>("");
  const [useMainnet, setUseMainnet] = useState<boolean>(false);
  const [openFeedback, setOpenFeedback] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [showPreviousFeedback, setShowPreviousFeedback] = useState<boolean>(false);
  const [previousFeedback, setPreviousFeedback] = useState<FeedbackData[]>([]);

  useEffect(() => {
    // Load previous feedback from localStorage
    const stored = localStorage.getItem('art3mis_feedback');
    if (stored) {
      setPreviousFeedback(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const isValid = 
      rating >= 1 && 
      rating <= 10 &&
      readingSatisfaction >= 1 && 
      readingSatisfaction <= 10 &&
      willingToPay !== "" &&
      parseFloat(willingToPay) >= 0;
    
    setIsFormValid(isValid);
  }, [rating, readingSatisfaction, willingToPay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    const feedbackData: FeedbackData = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      rating,
      readingSatisfaction,
      willingToPay,
      useMainnet,
      openFeedback,
    };

    // Store in localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('art3mis_feedback') || '[]');
    const updatedFeedback = [feedbackData, ...existingFeedback];
    localStorage.setItem('art3mis_feedback', JSON.stringify(updatedFeedback));
    setPreviousFeedback(updatedFeedback);

    toast({
      title: "Thank you for your feedback!",
      description: "Your response has been recorded.",
    });

    // Reset form
    setRating(5);
    setReadingSatisfaction(5);
    setWillingToPay("");
    setUseMainnet(false);
    setOpenFeedback("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Testnet Feedback</CardTitle>
          <CardDescription>Help us improve Art3mis Oracle by sharing your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rate your experience (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                required
                className="max-w-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reading satisfaction (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={readingSatisfaction}
                onChange={(e) => setReadingSatisfaction(Number(e.target.value))}
                required
                className="max-w-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                How much would you pay for a reading? (in APT)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={willingToPay}
                onChange={(e) => setWillingToPay(e.target.value)}
                required
                className="max-w-[120px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useMainnet}
                onChange={(e) => setUseMainnet(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label className="text-sm font-medium">
                Would you use Art3mis Oracle on mainnet?
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional feedback
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={openFeedback}
                onChange={(e) => setOpenFeedback(e.target.value)}
                placeholder="Share your thoughts..."
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full"
            >
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      {previousFeedback.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">
              <Button 
                variant="ghost" 
                onClick={() => setShowPreviousFeedback(!showPreviousFeedback)}
                className="p-0 hover:bg-transparent"
              >
                Previous Feedback ({previousFeedback.length})
              </Button>
            </CardTitle>
          </CardHeader>
          {showPreviousFeedback && (
            <CardContent>
              <div className="space-y-4">
                {previousFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 rounded-lg bg-muted">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Rating: {feedback.rating}/10</div>
                      <div>Reading Satisfaction: {feedback.readingSatisfaction}/10</div>
                      <div>Willing to Pay: {feedback.willingToPay} APT</div>
                      <div>Use on Mainnet: {feedback.useMainnet ? 'Yes' : 'No'}</div>
                      {feedback.openFeedback && (
                        <div className="col-span-2">
                          <p className="font-medium">Additional Feedback:</p>
                          <p className="mt-1">{feedback.openFeedback}</p>
                        </div>
                      )}
                      <div className="col-span-2 text-xs text-muted-foreground">
                        Submitted: {new Date(feedback.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
} 