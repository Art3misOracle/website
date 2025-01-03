import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function FeedbackForm() {
    const handleFeedbackClick = () => {
    // Change the link to where you want to redirect
    window.location.href = "https://forms.gle/81WhiBc9RcsoG5JaA";
    toast({
      title: "Redirecting",
      description: "You will be redirected to the feedback page.",
    });
  };

  return (
    <div className="flex justify-center">
      <Button 
        onClick={handleFeedbackClick} 
        className="bg-gray-500 text-white hover:bg-gray-600"
      >
        Send Feedback
      </Button>
    </div>
  );
} 