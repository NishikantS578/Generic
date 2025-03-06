import { GoogleGenerativeAI } from "@google/generative-ai";

// Define interfaces for better type safety
interface ChatMessage {
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private context: string = "";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (error) {
      console.error("Error initializing Gemini:", error);
      throw new Error("Failed to initialize AI service");
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  async getResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // Format conversation history into a clear prompt
      const conversationHistory = messages
        .map(
          (msg) =>
            `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `
        Context about the website: ${this.context}

        Previous conversation:
        ${conversationHistory}

        Please provide a helpful response as a customer support agent. Keep the context of the previous conversation in mind when responding.
        Be concise but helpful in your responses.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("Detailed AI response error:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        details: error.details || "No additional details",
      });

      if (error.message?.includes("API key")) {
        return "There seems to be an issue with the API key. Please check if it's valid.";
      }
      if (error.message?.includes("quota")) {
        return "The API quota has been exceeded. Please try again later.";
      }
      if (error.message?.includes("network")) {
        return "There seems to be a network issue. Please check your internet connection.";
      }

      return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
  }
}
