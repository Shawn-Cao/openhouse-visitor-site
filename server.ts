import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint: Generate personalized AI follow-up for open house leads
app.post('/api/generate-followup', async (req, res) => {
  try {
    const { buyer, listing, agent, followUpGoal } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback generator if key not provided
      return res.json({
        sms: `Hi ${buyer.name.split(' ')[0]}! This is ${agent.name} with ${agent.brokerage}. Thanks for visiting ${listing.address} today! I noticed you were particularly interested in the ${buyer.topInterest || 'kitchen and patio'}. Would you like the complete disclosure packet or a private 2nd tour this week?`,
        emailSubject: `Following up on your visit to ${listing.address} | Disclosures & Video Walkthrough`,
        emailBody: `Hi ${buyer.name},\n\nIt was great meeting you at our Open House for ${listing.address} today!\n\nI noted that you spent extra time in the ${buyer.topInterest || 'gourmet kitchen'} and asked about the ${buyer.recentQuestion || 'recent upgrades and school district'}.\n\nHere are the quick resources you might need:\n• Full Property Disclosures & Inspection Report\n• 3D Virtual Tour Replay & Floorplans\n• HOA Bylaws & Recent Neighborhood Comps\n\nSince you are looking to move in the next ${buyer.timeline || '1-3 months'}, I'd love to set up a private 15-minute walkthrough or answer any specific questions for you.\n\nBest regards,\n${agent.name}\n${agent.phone} | ${agent.email}\n${agent.brokerage}`,
        strategyNote: 'High intent buyer with verified pre-approval. Prioritize booking private inspection review.',
        suggestedNextAction: 'Send SMS within 45 minutes, followed by personalized disclosure email.'
      });
    }

    const prompt = `You are an elite real estate sales assistant acting on behalf of seller's listing agent ${agent.name} from ${agent.brokerage}.
A buyer visited the open house for ${listing.address} ($${Number(listing.price).toLocaleString()}).

Visitor Profile:
- Name: ${buyer.name}
- Phone: ${buyer.phone}
- Email: ${buyer.email}
- Financing: ${buyer.financing || 'Pre-approved'}
- Moving Timeline: ${buyer.timeline || '1-3 months'}
- Represented by an agent: ${buyer.hasAgent ? 'Yes' : 'No (Unrepresented / Direct lead)'}
- Key Rooms Visited & Dwell Time: ${buyer.visitedRooms?.join(', ') || 'Chef Kitchen, Primary Suite, Backyard'}
- Questions / Comments during tour: "${buyer.comments?.join('; ') || 'Loved the natural light and island countertop'}"
- Specific Follow-up Goal: ${followUpGoal || 'Drive private showing & disclosure packet review'}

Generate a JSON response with:
1. "sms": A concise, warm, high-converting text message under 240 characters mentioning a specific detail from their visit.
2. "emailSubject": A compelling, non-spammy subject line.
3. "emailBody": A personalized follow-up email mentioning specific property highlights they engaged with, direct answers to their questions, attachment links (disclosures, floorplan), and a low-friction call-to-action.
4. "strategyNote": A 1-2 sentence tactical advice note for the listing agent.
5. "suggestedNextAction": Recommended next touchpoint time and method.

Output ONLY valid JSON with keys: "sms", "emailSubject", "emailBody", "strategyNote", "suggestedNextAction".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Error generating follow up:', error);
    res.status(500).json({ error: error.message || 'Failed to generate follow-up' });
  }
});

// Endpoint: Analyze Open House Comments & Sentiment
app.post('/api/analyze-feedback', async (req, res) => {
  try {
    const { comments, listing, visitorStats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        overallSentimentScore: 88,
        sentimentSummary: "Exceptionally strong buyer response to modern kitchen remodel and indoor-outdoor patio flow. Minor questions around HOA reserves and backyard fencing.",
        topPraises: ["Chef's kitchen quartz island & appliance package", "Abundant natural daylight in vaulted living room", "Spacious primary suite walk-in closet"],
        topObjectionsOrQuestions: ["HOA monthly dues breakdown", "Possibility of adding a pool in the backyard", "Offer review deadline timing"],
        realtorTalkingPoints: [
          "Highlight the low HOA reserve risk with recent 2024 roof replacement completed.",
          "Emphasize the city permits already pre-approved for outdoor landscape/deck extension.",
          "Remind interested buyers of the Tuesday 5:00 PM offer review deadline."
        ]
      });
    }

    const prompt = `You are a real estate market analyst. Analyze the following feedback, visitor questions, and dwell data collected during an open house for ${listing.address}:

Visitor Stats: ${JSON.stringify(visitorStats)}
Buyer Comments & Questions:
${JSON.stringify(comments, null, 2)}

Provide a structured JSON output with:
1. "overallSentimentScore" (Number 0 to 100)
2. "sentimentSummary" (2-3 sentences summarizing market reaction)
3. "topPraises" (Array of 3 strings: the biggest selling features according to attendees)
4. "topObjectionsOrQuestions" (Array of 3 strings: key concerns or frequent inquiries)
5. "realtorTalkingPoints" (Array of 3 strings: proactive responses the agent can use in follow-ups and broker remarks)

Output ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing feedback:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze feedback' });
  }
});

// Endpoint: Generate Homeowner / Seller Open House Debrief Report
app.post('/api/seller-report', async (req, res) => {
  try {
    const { listing, stats, highIntentBuyers, keyTakeaways } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reportTitle: `Open House Performance Debrief: ${listing.address}`,
        executiveSummary: `Our Open House generated strong market momentum with ${stats.totalVisitors} total visitor parties, of which ${stats.hotLeads} are verified high-intent buyers. The property's architectural presentation and updated finishes resonated significantly with current market demand.`,
        keyHighlights: [
          `Peak attendance between 1:30 PM - 3:00 PM with average dwell time of 24.5 minutes.`,
          `3 unrepresented qualified buyers expressed interest in writing offers before the review deadline.`,
          `Virtual tour replay pages were accessed 42 times within 3 hours after event conclusion.`
        ],
        pricingAndMarketFeedback: `Buyers overwhelmingly agreed the $${Number(listing.price).toLocaleString()} list price aligns with recent neighborhood comps. Two buyers cited readiness to compete if multiple bids arise.`,
        recommendedNextSteps: [
          `Issue digital disclosure packets to the top 5 high-intent buyer agents by 9:00 AM tomorrow.`,
          `Broadcast offer submission deadline (Tuesday 5:00 PM) to all verified attendees.`,
          `Host private secondary walkthroughs for the 2 pre-approved cash & conventional prospects.`
        ]
      });
    }

    const prompt = `You are a top-tier luxury listing agent preparing a polished, professional Open House Debrief Report to email to your home seller client.

Listing: ${listing.address} ($${Number(listing.price).toLocaleString()})
Stats: Total visitors: ${stats.totalVisitors}, High-Intent Buyers: ${stats.hotLeads}, Unrepresented Leads: ${stats.unrepresented}, Virtual Tour Interactions: ${stats.tourViews}
High intent buyer notes: ${JSON.stringify(highIntentBuyers)}
Key takeaways: ${JSON.stringify(keyTakeaways)}

Return a structured JSON with:
1. "reportTitle": String
2. "executiveSummary": 3-4 sentence professional summary reassuring the homeowner.
3. "keyHighlights": Array of 3 specific metric-backed observations.
4. "pricingAndMarketFeedback": 2-3 sentences on buyer price perception and competition appetite.
5. "recommendedNextSteps": Array of 3 clear strategic actions the agent is executing next.

Output ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Error generating seller report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate seller report' });
  }
});

// Endpoint: AI Property QA Assistant for Virtual Tour Attendees
app.post('/api/property-qa', async (req, res) => {
  try {
    const { question, property, propertyContext, room, currentRoom } = req.body;
    const prop = property || propertyContext || {};
    const roomName = room || currentRoom || 'General Property';
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `Great question regarding ${roomName}! At ${prop.address || '428 Crestview'}, this home features custom architectural finishes, Sub-Zero/Wolf kitchen suite, and verified pre-inspections. Listing agent ${prop.agent?.name || 'Sarah Jenkins'} is available live during today's open house for any specific questions.`,
        confidence: 0.95,
        suggestedFollowUp: 'Would you like to schedule a private showing or download the full disclosure vault?'
      });
    }

    const prompt = `You are the AI Open House Concierge for ${prop.address || '428 Crestview Ridge Way'}. You represent listing agent ${prop.agent?.name || 'Sarah Jenkins'}.
Property Details:
- Type: ${prop.propertyType || 'Modern Architectural Single Family'}
- Beds/Baths: ${prop.beds || 4} Beds, ${prop.baths || 4.5} Baths
- SqFt: ${prop.sqft || 4120} sqft
- List Price: $${Number(prop.price || 2850000).toLocaleString()}
- Year Built / Remodeled: 2021 / 2023 Custom Remodel
- Features: Fleetwood pocket glass doors, Sub-Zero & Wolf appliances, 14ft Taj Mahal quartzite island, heated Calacatta marble primary spa bath, zero-edge heated saltwater plunge pool, 450-bottle wine vault, low $180/mo HOA security patrol.
- Current Room Context: ${roomName}

Visitor Question: "${question}"

Respond warmly, concisely (under 3 sentences), accurately representing the property's luxury value, and invite them to drop a question pin on the 3D tour or request the disclosure packet.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a courteous, knowledgeable real estate listing concierge.',
      },
    });

    res.json({
      answer: response.text || 'Thank you for your question! The listing agent will follow up with full details.',
      suggestedFollowUp: 'Would you like to schedule a private walkthrough?'
    });
  } catch (error: any) {
    console.error('Error answering property QA:', error);
    res.status(500).json({ error: error.message || 'Failed to answer QA' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenHouse Pro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
