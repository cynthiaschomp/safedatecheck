
import { GoogleGenAI } from "@google/genai";
import { getStoredApiKey } from "./apikey";
import { SearchParams, ReportData, ResearchLink, EvidenceAnalysis, SavedRecord, ProfileMatchResult } from "../types";

// BYOK: API key is provided by the user at runtime, stored in localStorage.
// Never falls back to a server-side env variable.
const getAI = () => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("No Gemini API key configured. Please add your API key in Settings.");
  }
  // Always create a fresh instance with the current key (handles key changes)
  return new GoogleGenAI({ apiKey });
};

export const generateBackgroundReport = async (params: SearchParams): Promise<ReportData> => {
  const { firstName, lastName, location, dob, additionalContext, aliases, socialProfiles, image, imageMimeType } = params;

  const promptText = `
    Perform a deep-dive public records and online presence background check for:
    Subject: ${firstName} ${lastName}
    Location Scope: ${location}
    ${dob ? `DOB/Age: ${dob}` : ''}
    ${aliases ? `Aliases: ${aliases}` : ''}
    ${socialProfiles ? `User Provided Social Profiles: ${socialProfiles}` : ''}
    ${additionalContext ? `Context: ${additionalContext}` : ''}
    ${image ? `[IMAGE ATTACHED]: Use the attached image to verify identity, check for matches in news/media, or extract text from dating profile screenshots.` : ''}

    OBJECTIVE:
    Identify this specific individual, assess safety, and compile a comprehensive report including their digital footprint.
    **CRITICAL:** If information is unknown or not found, keep the section extremely brief (e.g., "No records found"). Do not fill space with generic advice.
    **CRITICAL:** Provide as many relevant official research links as possible for the user to verify themselves.

    CRITICAL INSTRUCTION ON AMBIGUITY:
    If multiple people match, create a section titled "## ⚠️ Possible Matches Found" and list the top 3 matches with Name, Age, Cities, and Relatives.

    REPORT STRUCTURE (Strictly follow these section headers):

    1. ## 🛡️ Safety Analysis
       - Provide a "Safety Score: [0-100]" on its own line. (0 = Safe, 100 = Critical Danger).
       - *CRITICAL:* If violent crimes (domestic abuse, assault, sexual offenses, restraining orders) are found, score MUST be > 80.
       - *CRITICAL:* If clean record, score should be < 20.
       - Summarize the reasoning for the score in 1-2 sentences.
    
    2. ## 📰 Public News & Media
       - Search for major news articles.
       - If no significant media coverage is found, state "No significant public media coverage found." and move on.

    3. ## 🌐 Online Presence & Social Media
       - **AGGRESSIVELY SEARCH** for this person's digital footprint across: LinkedIn, Facebook, Instagram, X (Twitter), TikTok, Pinterest, and personal websites.
       - **FORMAT:** List each profile found as a bullet point with the direct URL.
       - Example: "- [Facebook]: https://www.facebook.com/username"
       - If not found, simply state "No specific social profiles identified."

    4. ## 🔍 Key Findings & Identity
       - Verify age, current city.
       - If unknown, state "Unverified".

    5. ## 🚨 Sex Offender Registry Details
       - **CRITICAL:** Search specifically for this name in Sex Offender Registries (NSOPW).
       - If a match is found, list: Offense, Date of Conviction, and Registration Status.
       - If NO match is found, state: "No matching records found in national or state sex offender registries."

    6. ## ⚖️ Court & Legal Records
       - Criminal (Arrests, Felonies, Misdemeanors) - highlight VIOLENT OFFENSES.
       - Civil (Liens, Bankruptcies, Evictions).
       - Traffic (DUI/DWI).
       - If no records found, state "No public court records found in this jurisdiction."

    7. ## 💍 Family & Relationships
       - Marriage/Divorce history.
       - If unknown, state "No public marriage/divorce records found."

    8. ## 📍 Location History
       - List previous cities/states.

    9. ## 👥 Known Associates
       - Relatives, roommates, business partners.

    10. ## 🔗 Official Records Research
       - **MAXIMIZE LINKS:** List 5-10 specific government/official websites where the user can manually search.
       - Include links for: County Clerks, Sex Offender Registries (NSOPW), Department of Corrections, and Property Appraisers for the locations identified.
       - Format each line as: "LINK: [URL] - [Description]"
       - Example: "LINK: https://www.clerk.org - Search Civil Records in Miami-Dade County"

    TONE:
    Objective, factual, and safety-first. Low detail if unknown. High detail on Links.
  `;

  const parts: any[] = [{ text: promptText }];
  
  if (image && imageMimeType) {
    parts.push({
      inlineData: {
        data: image,
        mimeType: imageMimeType
      }
    });
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a professional background check analyst for women's safety. Your goal is to identify risks and find the person's digital footprint. You calculate safety scores based on criminal history severity.",
      },
    });

    const text = response.text || "No report generated.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // --- PARSING THE RESPONSE ---

    // 1. Extract Safety Score
    const scoreMatch = text.match(/Safety Score:\s*(\d+)/i);
    let safetyScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 10; // Default to 10 (low risk) if not found
    if (isNaN(safetyScore)) safetyScore = 50; // Fallback if parse fails

    let safetyLevel: 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'CRITICAL' = 'SAFE';
    if (safetyScore >= 80) safetyLevel = 'CRITICAL';
    else if (safetyScore >= 50) safetyLevel = 'HIGH_RISK';
    else if (safetyScore >= 20) safetyLevel = 'CAUTION';

    // 2. Extract Recommended Directories
    const researchLinks: ResearchLink[] = [];
    const linkRegex = /LINK:\s*(https?:\/\/[^\s]+)\s*-\s*(.+)/g;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      researchLinks.push({
        title: "Official Record Search",
        url: match[1],
        description: match[2]
      });
    }

    // 3. Extract Risk Analysis (First paragraph of Safety Analysis section usually)
    let riskAnalysis = "Review the report details below.";
    const safetySection = text.split("## 🛡️ Safety Analysis")[1]?.split("##")[0];
    if (safetySection) {
      // Remove the score line to get the text
      riskAnalysis = safetySection.replace(/Safety Score:.*\n?/i, "").trim();
    }

    return {
      summary: text,
      sources: chunks,
      riskAnalysis,
      safetyScore,
      safetyLevel,
      recommendedDirectories: researchLinks,
      timestamp: Date.now()
    };

  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    throw new Error(error.message || "Failed to generate report. Please try again.");
  }
};

export const analyzeEvidence = async (text: string, imageBase64?: string, imageMime?: string): Promise<EvidenceAnalysis> => {
  const prompt = `
    Analyze the following user-submitted evidence regarding a person. 
    The evidence might be a text description of events or a screenshot of a text message conversation.

    USER DESCRIPTION: ${text}
    
    TASK:
    Look for specific psychological and behavioral red flags:
    - Gaslighting (denying reality, making the victim doubt sanity)
    - Narcissistic Abuse (love bombing, devaluation, discard)
    - Threats of violence or blackmail
    - Financial manipulation
    - Coercive control
    
    OUTPUT JSON format:
    {
      "isHarmful": boolean,
      "riskScore": number (0-100),
      "summary": "Short 2 sentence summary of findings",
      "detectedBehaviors": ["List", "Of", "Behaviors"]
    }
  `;

  const parts: any[] = [{ text: prompt }];
  if (imageBase64 && imageMime) {
    parts.push({
      inlineData: { data: imageBase64, mimeType: imageMime }
    });
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Analysis failed", e);
    return {
      isHarmful: false,
      riskScore: 0,
      summary: "Could not analyze evidence.",
      detectedBehaviors: []
    };
  }
};

export const checkProfileMatch = async (
  newProfile: { firstName: string; lastName: string; location: string; details: string },
  existingRecords: SavedRecord[]
): Promise<ProfileMatchResult> => {
  // If no existing records, simplistic return.
  if (existingRecords.length === 0) {
    return { matchFound: false, confidence: 0, reasoning: "No profiles in database to match against." };
  }

  // Create a minified list of candidates to save tokens
  const candidates = existingRecords.map(r => ({
    id: r.id,
    name: `${r.params.firstName} ${r.params.lastName}`,
    location: r.params.location,
    dob: r.params.dob
  }));

  const prompt = `
    I have a user trying to submit information about a person. I need to know if this person already exists in my database.

    NEW SUBMISSION:
    Name: ${newProfile.firstName} ${newProfile.lastName}
    Location: ${newProfile.location}
    Details: ${newProfile.details}

    EXISTING DATABASE CANDIDATES:
    ${JSON.stringify(candidates, null, 2)}

    TASK:
    Compare the New Submission against the candidates.
    If there is a high probability (> 80%) they are the same person (based on name similarity and location match), return matchFound: true.
    
    OUTPUT JSON:
    {
      "matchFound": boolean,
      "matchedRecordId": "string (ID of match) or null",
      "confidence": number (0-100),
      "reasoning": "Explanation of why it matched or didn't"
    }
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Matching failed", e);
    return { matchFound: false, confidence: 0, reasoning: "AI error during matching." };
  }
};
