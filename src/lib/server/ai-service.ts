import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gets Gemini API key from environment variables
 */
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set in environment variables. Please add it to your .env.local file."
    );
  }
  return apiKey;
}

/**
 * AI Processing Result
 */
export interface AIAnalysisResult {
  tags: string[];
  description: string;
  colors: string[];
}

/**
 * Analyzes an image using Google Gemini API
 * 
 * @param imageBase64 - Base64 encoded image data
 * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns AI analysis result with tags, description, and colors
 */
export async function analyzeImageWithAI(
  imageBase64: string,
  mimeType: string
): Promise<AIAnalysisResult> {
  try {
    const apiKey = getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash as per official Gemini API documentation
    // Reference: https://ai.google.dev/gemini-api/docs
    // This model supports multimodal input including images
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a comprehensive prompt for deep image analysis
    const prompt = `Analyze this image in great detail and provide a comprehensive analysis:

1. **Tags**: Perform a deep analysis and generate 5-10 highly relevant tags that describe:
   - Main subjects and objects in the image
   - Scene type and setting (indoor/outdoor, location type)
   - Visual style and composition
   - Mood, atmosphere, and emotional tone
   - Activities or actions taking place
   - Time of day, weather, or lighting conditions
   - Art style, genre, or photographic technique
   - Any notable details, patterns, or textures
   Be specific and descriptive. Return as an array of strings.

2. **Description**: Write one detailed, descriptive sentence (25-35 words) that comprehensively describes:
   - What is prominently visible in the image
   - The main subject(s) and their context
   - The setting, environment, or background
   - Notable visual elements, colors, or composition
   - The overall scene or moment captured
   Make it vivid and informative, as if describing the image to someone who cannot see it.

3. **Colors**: Perform a thorough color analysis and identify the top 3 dominant colors:
   - Analyze the entire image for color distribution
   - Consider both foreground and background colors
   - Identify the most visually prominent colors that define the image
   - Return as hex color codes in uppercase format (e.g., #FF5733, #3498DB, #2ECC71)
   - Ensure colors are accurate representations of what's actually in the image
   - Colors should be distinct from each other

Format your response as valid JSON only:
{
  "tags": ["specific", "descriptive", "tags", "here"],
  "description": "A detailed descriptive sentence about the image content, setting, and visual elements.",
  "colors": ["#HEX1", "#HEX2", "#HEX3"]
}

Important:
- Return ONLY the JSON object, no markdown, no code blocks, no additional text
- Ensure all tags are lowercase and specific
- Colors must be valid 6-digit hex codes starting with #
- Description should be exactly one sentence, 25-35 words`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const geminiResult = await model.generateContent([prompt, imagePart]);
    const response = await geminiResult.response;
    const text = response.text();

    // Parse the JSON response
    // Gemini may wrap JSON in markdown code blocks or return it directly
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    const jsonBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonText = jsonBlockMatch[1].trim();
    }
    
    // Extract JSON object if wrapped in other text
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0];
    }
    
    // Clean up any trailing text after the closing brace
    const braceIndex = jsonText.lastIndexOf('}');
    if (braceIndex !== -1) {
      jsonText = jsonText.substring(0, braceIndex + 1);
    }
    
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }

    // Validate and format the response with enhanced processing
    let tags: string[] = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((tag: string) => String(tag).toLowerCase().trim())
          .filter((tag: string) => tag.length > 0)
          .slice(0, 10) // Ensure max 10 tags
      : [];
    
    // Remove duplicates while preserving order
    tags = Array.from(new Set(tags));
    
    // Ensure we have meaningful tags (remove generic ones if we have specific ones)
    const genericTags = ["image", "photo", "picture"];
    if (tags.length > genericTags.length) {
      tags = tags.filter((tag: string) => !genericTags.includes(tag));
    }
    
    let description: string | null = typeof parsed.description === "string"
      ? parsed.description.trim().replace(/\s+/g, " ") // Normalize whitespace
      : null;
    
    // Validate that we got actual AI results, not fallback
    if (!description || description === "An image with various elements." || description === "An image that has been uploaded.") {
      description = null; // Set to null so we know it's invalid
    }

    // Enhanced color processing
    let colors: string[] = Array.isArray(parsed.colors)
      ? parsed.colors
          .map((color: string) => {
            const colorStr = String(color).trim().toUpperCase();
            
            // If already a hex code, validate and return
            if (colorStr.startsWith("#")) {
              // Handle 3-digit hex codes
              if (/^#[0-9A-F]{3}$/i.test(colorStr)) {
                return `#${colorStr[1]}${colorStr[1]}${colorStr[2]}${colorStr[2]}${colorStr[3]}${colorStr[3]}`;
              }
              // Handle 6-digit hex codes
              if (/^#[0-9A-F]{6}$/i.test(colorStr)) {
                return colorStr;
              }
            }
            
            // Try to parse RGB format: rgb(255, 0, 0) or rgba(255, 0, 0, 1)
            const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (rgbMatch) {
              const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, "0");
              const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, "0");
              const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, "0");
              return `#${r}${g}${b}`.toUpperCase();
            }
            
            return null;
          })
          .filter((color: string | null): color is string => 
            color !== null && /^#[0-9A-F]{6}$/i.test(color)
          )
          .slice(0, 3)
      : [];

    // Enhanced fallback for colors if AI doesn't provide valid ones
    if (colors.length === 0 && description) {
      // Try to extract color mentions from description with enhanced context
      const colorKeywords: Record<string, string> = {
        red: "#FF0000",
        crimson: "#DC143C",
        scarlet: "#FF2400",
        blue: "#0000FF",
        navy: "#000080",
        sky: "#87CEEB",
        cyan: "#00FFFF",
        green: "#00FF00",
        emerald: "#50C878",
        forest: "#228B22",
        yellow: "#FFFF00",
        gold: "#FFD700",
        amber: "#FFBF00",
        orange: "#FFA500",
        coral: "#FF7F50",
        purple: "#800080",
        violet: "#8B00FF",
        lavender: "#E6E6FA",
        pink: "#FFC0CB",
        rose: "#FF007F",
        brown: "#A52A2A",
        tan: "#D2B48C",
        beige: "#F5F5DC",
        black: "#000000",
        charcoal: "#36454F",
        white: "#FFFFFF",
        ivory: "#FFFFF0",
        gray: "#808080",
        grey: "#808080",
        silver: "#C0C0C0",
      };
      
      const descriptionLower = description.toLowerCase();
      const foundColors: string[] = [];
      
      // Find color mentions in description
      for (const [keyword, hex] of Object.entries(colorKeywords)) {
        if (descriptionLower.includes(keyword) && foundColors.length < 3) {
          foundColors.push(hex);
        }
      }
      
      colors.push(...foundColors);
    }

    // Ensure we have exactly 3 colors (pad with neutral grays if needed)
    while (colors.length < 3) {
      const neutralColors = ["#808080", "#A0A0A0", "#C0C0C0"];
      const nextColor = neutralColors[colors.length % neutralColors.length];
      if (!colors.includes(nextColor)) {
        colors.push(nextColor);
      } else {
        colors.push("#808080"); // Default gray
      }
    }
    
    // Remove duplicates and ensure exactly 3 unique colors
    colors = Array.from(new Set(colors)).slice(0, 3);

    // Only use fallback if we have a valid description to work with
    if (description && tags.length < 5) {
      const fallbackTags = generateFallbackTags(description);
      // Merge and deduplicate
      tags = Array.from(new Set([...tags, ...fallbackTags])).slice(0, 10);
    }

    // If we still don't have valid results, throw an error
    if (!description || tags.length === 0) {
      throw new Error("AI did not return valid description or tags. Please check your GEMINI_API_KEY and try again.");
    }

    const aiResult: AIAnalysisResult = {
      tags: tags.slice(0, 10), // Max 10 tags
      description: description,
      colors: colors.slice(0, 3), // Exactly 3 colors
    };

    return aiResult;
  } catch (error) {
    
    // Re-throw the error so the API route can handle it properly
    // Don't return fallback values - let the caller decide what to do
    throw new Error(
      `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generates fallback tags from description if AI doesn't provide enough
 * Enhanced to extract more meaningful keywords
 */
function generateFallbackTags(description: string): string[] {
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 0);
  
  const commonWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "to", "for", "of", "with", "and", "or", "but",
    "this", "that", "these", "those", "it", "its", "they", "them",
    "can", "could", "should", "would", "may", "might", "must",
    "have", "has", "had", "do", "does", "did", "will", "shall"
  ]);
  
  // Extract meaningful words (nouns, adjectives, verbs)
  const meaningfulWords = words
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
    .slice(0, 7); // Get up to 7 words
  
  // Add context-based tags if description contains certain keywords
  const contextTags: string[] = [];
  const descLower = description.toLowerCase();
  
  if (descLower.includes("outdoor") || descLower.includes("outside") || descLower.includes("nature")) {
    contextTags.push("outdoor", "nature");
  }
  if (descLower.includes("indoor") || descLower.includes("inside") || descLower.includes("room")) {
    contextTags.push("indoor");
  }
  if (descLower.includes("sunset") || descLower.includes("sunrise") || descLower.includes("dusk") || descLower.includes("dawn")) {
    contextTags.push("sunset", "sky");
  }
  if (descLower.includes("people") || descLower.includes("person") || descLower.includes("human")) {
    contextTags.push("people", "portrait");
  }
  if (descLower.includes("building") || descLower.includes("architecture") || descLower.includes("structure")) {
    contextTags.push("architecture", "building");
  }
  
  const allTags = [...meaningfulWords, ...contextTags]
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, 10);
  
  return allTags.length > 0 ? allTags : ["image", "photo", "picture", "visual", "content"];
}

