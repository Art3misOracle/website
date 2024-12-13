import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeedbackForm() {
  const [rating, setRating] = useState<number>(5);
  const [readingSatisfaction, setReadingSatisfaction] = useState<number>(5);
  const [willingToPay, setWillingToPay] = useState<string>("");
  const [useMainnet, setUseMainnet] = useState<boolean>(false);
  const [openFeedback, setOpenFeedback] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    // Check if all required fields are filled
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

    const formData = {
      rating,
      readingSatisfaction,
      willingToPay,
      useMainnet,
      openFeedback,
    };

    toast({
      title: "Thank you for your feedback!",
      description: "Your response has been recorded.",
    });

    setRating(5);
    setReadingSatisfaction(5);
    setWillingToPay("");
    setUseMainnet(false);
    setOpenFeedback("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Testnet Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
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
            />
          </div>

          <div className="flex flex-col gap-2">
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
            />
          </div>

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Additional feedback
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={openFeedback}
              onChange={(e) => setOpenFeedback(e.target.value)}
              placeholder="Share your thoughts..."
            />
          </div>

          <Button 
            type="submit"
            disabled={!isFormValid}
            variant={isFormValid ? "default" : "secondary"}
          >
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 