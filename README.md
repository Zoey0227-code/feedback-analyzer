# AI Customer Voice Analyzer (PM Intern Technical Task)

**Live Demo:** [https://feedback-analyzer.zoey152-huang.workers.dev/]

**Goal:** Automate the extraction of actionable product insights from raw, multi-source customer feedback.

## The Product Vision
Product Managers often drown in feedback from Support, GitHub, and Forums. This tool uses LLMs (Llama 3) to move from "reading text" to "making decisions" by automatically categorizing sentiment, urgency, and specific engineering action items.

## Tech Stack & Architecture
- **AI Engine:** Meta Llama 3 (via Cloudflare Workers AI)
- **Compute:** Cloudflare Workers (Serverless)
- **Database:** Cloudflare D1 (SQL) for persistent insight storage
- **Frontend:** Responsive Vanilla JS Dashboard

## Key PM Features Included
1. **Automated Prioritization:** Uses AI to flag "High Urgency" items automatically.
2. **Thematic Tagging:** Routes feedback into buckets like UI/UX, Performance, or Billing.
3. **Actionable Recommendations:** Generates specific "Next Steps" for engineering teams rather than just summaries.

## Future Roadmap (If I had more time)
- **Sentiment Trend Dashboard:** A chart showing if customer mood is improving over time.
- **Slack Integration:** Automatically push "High Urgency" negative feedback to the dev team's channel.
- **Competitor Benchmarking:** Using AI to compare feedback themes against industry competitors.
