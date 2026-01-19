/**
 * 1. CLIENT-SIDE JAVASCRIPT
 * We define this as a separate string to avoid "Backtick Inception" (nesting backticks).
 * This script runs in the user's browser.
 */
const CLIENT_SCRIPT = `
  console.log("Client script initialized");

  const out = document.getElementById("out");
  const refreshBtn = document.getElementById("refreshBtn");
  const feedbackList = document.getElementById("feedbackList");
  const feedbackStatus = document.getElementById("feedbackStatus");
  const analyzeBtn = document.getElementById("analyze");
  const sampleBtn = document.getElementById("sample");

  // Helper to render the list of feedback
  function renderFeedback(results) {
    if (!results || results.length === 0) {
      feedbackList.textContent = "No stored feedback yet.";
      feedbackStatus.textContent = "";
      return;
    }

    const blocks = results.map(function (r) {
      // We use concatenation here instead of backticks to keep it simple inside this string
      return (
        "#" + r.id + " | " + (r.created_at || "") + "\\n" +
        "Source: " + (r.source || "") + " | Priority: " + (r.priority || "") + "\\n" +
        "Sentiment: " + (r.sentiment || "") + " | Urgency: " + (r.urgency || "") + "\\n" +
        "Theme: " + (r.theme || "") + "\\n\\n" +
        "Summary:\\n" + (r.summary || "") + "\\n" +
        "----------------------------------------"
      );
    });

    feedbackList.textContent = blocks.join("\\n\\n");
    feedbackStatus.textContent = "Loaded " + results.length + " entries";
  }

  // Helper to fetch stored data
  async function refreshStored() {
    feedbackStatus.textContent = "Loading...";
    feedbackList.textContent = "";

    try {
      const res = await fetch("/api/feedback");
      if (!res.ok) {
        feedbackList.textContent = "Failed to load feedback";
        return;
      }
      const data = await res.json();
      renderFeedback(data.results);
    } catch (e) {
      console.error(e);
      feedbackList.textContent = "Error loading feedback";
    }
  }

  // --- EVENT LISTENERS ---

  if (sampleBtn) {
    sampleBtn.addEventListener("click", function (e) {
      e.preventDefault(); // Stop any weird reloading
      const el = document.getElementById("text");
      // FIXED: Kept on a single line to prevent SyntaxError
      el.value = "The dashboard is powerful but extremely confusing. I spent 25 minutes figuring out how to deploy my Worker. The docs jump between beginner and advanced steps.";
      console.log("Sample text inserted");
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async function (e) {
      e.preventDefault(); 
      
      const textEl = document.getElementById("text");
      const sourceEl = document.getElementById("source");
      const priorityEl = document.getElementById("priority");

      const text = (textEl ? textEl.value : "").trim();
      const source = sourceEl ? sourceEl.value : "Unknown";
      const priority = priorityEl ? priorityEl.value : "Medium";

      if (!text) {
        out.textContent = "Please paste feedback first.";
        return;
      }

      out.textContent = "Analyzing with Llama 3...";

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text, source: source, priority: priority })
        });

        if (!res.ok) {
          const msg = await res.text();
          out.textContent = "Request failed: " + res.status + "\\n" + msg;
          return;
        }

        const data = await res.json();
        out.textContent = JSON.stringify(data, null, 2);

        // Auto-refresh the list below
        refreshStored();
      } catch (e) {
        out.textContent = "Error: " + e.message;
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function(e) {
        e.preventDefault();
        refreshStored();
    });
  }
`;

/**
 * 2. HTML TEMPLATE
 * We inject the ${CLIENT_SCRIPT} at the bottom.
 */
const HTML = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Customer Feedback Analyzer</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; max-width: 960px; margin: 40px auto; padding: 0 16px; }
      textarea { width: 100%; height: 160px; padding: 10px; font-size: 14px; margin-top: 10px; }
      select, button { font-size: 14px; padding: 8px 10px; cursor: pointer; }
      .row { display: flex; gap: 10px; align-items: center; margin: 12px 0; flex-wrap: wrap; }
      .card { background: #f6f6f6; padding: 12px; border-radius: 12px; }
      pre { white-space: pre-wrap; margin: 0; }
      .muted { opacity: 0.7; font-size: 13px; }
    </style>
  </head>
  <body>
    <h1>Customer Feedback Analyzer</h1>
    <p>Paste feedback from any channel. This prototype simulates multi-source ingestion.</p>

    <div class="row">
      <label>Source:
        <select id="source">
            <option>Support Ticket</option>
            <option>GitHub Issue</option>
            <option>Community Forum</option>
        </select>
      </label>

      <label>Priority:
        <select id="priority">
            <option>Low</option>
            <option selected>Medium</option>
            <option>High</option>
        </select>
      </label>

      <button id="analyze" type="button" style="background: #000; color: #fff; border:none;">Analyze</button>
      <button id="sample" type="button">Insert sample</button>
    </div>

    <textarea id="text" placeholder="Paste customer feedback here..."></textarea>

    <h3>Analysis Result</h3>
    <div class="card">
      <pre id="out">Waiting for input.</pre>
    </div>
    
    <hr style="margin: 24px 0;" />

    <h2>Stored feedback</h2>
    <div style="margin-bottom:12px;">
      <button id="refreshBtn" type="button">Refresh Database</button>
      <span id="feedbackStatus" style="opacity:0.7; margin-left: 10px;"></span>
    </div>

    <pre id="feedbackList">No data loaded yet.</pre>

    <script>
      ${CLIENT_SCRIPT}
    </script>
  </body>
</html>
`;

function json(data, status = 200) {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Serve the UI
		if (request.method === 'GET' && url.pathname === '/') {
			return new Response(HTML, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' },
			});
		}

		// API: Get History
		if (request.method === 'GET' && url.pathname === '/api/feedback') {
			// NOTE: Ensure your wrangler.toml has binding = "feedback_db"
			const { results } = await env.feedback_db.prepare('SELECT * FROM feedback ORDER BY id DESC LIMIT 20').all();
			return json({ results });
		}

		// API: Analyze
		if (request.method === 'POST' && url.pathname === '/api/analyze') {
			const body = await request.json().catch(() => ({}));
			const text = (body.text || '').toString();
			const source = (body.source || 'Unknown').toString();
			const priority = (body.priority || 'Medium').toString();

			const prompt = `
You are a product manager. Return JSON only.
Schema: { "summary": "string", "sentiment": "positive|neutral|negative", "theme": "string", "urgency": "low|medium|high" }

Feedback (${source}, ${priority}):
${text}
`.trim();

			// Call Cloudflare AI
			const aiRaw = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
				messages: [{ role: 'user', content: prompt }],
			});

			// Simple parsing logic
			let aiText = aiRaw?.response || aiRaw?.result?.response || JSON.stringify(aiRaw);

			// Clean markdown code blocks if Llama adds them
			if (typeof aiText === 'string') {
				aiText = aiText
					.replace(/```json/g, '')
					.replace(/```/g, '')
					.trim();
			}

			let parsed = {};
			try {
				parsed = JSON.parse(aiText);
			} catch (e) {
				parsed = { summary: aiText };
			}

			const result = {
				source,
				priority,
				text,
				summary: parsed.summary || 'No summary',
				sentiment: parsed.sentiment || 'neutral',
				theme: parsed.theme || 'general',
				urgency: parsed.urgency || 'medium',
			};

			// Save to D1
			await env.feedback_db
				.prepare(
					`
        INSERT INTO feedback (source, priority, text, summary, sentiment, theme, urgency)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
				)
				.bind(result.source, result.priority, result.text, result.summary, result.sentiment, result.theme, result.urgency)
				.run();

			return json(result);
		}

		return new Response('Not found', { status: 404 });
	},
};
