"use client";

import { useState } from "react";
import {
  defaultTextModerationResult,
  textModerationExamples,
  type TextModerationUiResult,
} from "@/lib/moderation/text/shared";
import { requireAuthForModeration } from "@/lib/auth-client";

const initialText = textModerationExamples[0]?.translations.en ?? "";

export function TextPlayground() {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<TextModerationUiResult>(defaultTextModerationResult);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(nextText?: string) {
    const isAuthenticated = await requireAuthForModeration();

    if (!isAuthenticated) {
      return;
    }

    const content = (nextText ?? text).trim();

    if (!content) {
      setError("Please enter text to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/moderation/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        result?: TextModerationUiResult;
      };

      if (!response.ok || !payload.result) {
        throw new Error(payload.message ?? "Text moderation failed.");
      }

      setResult(payload.result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Text moderation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function useExample(exampleText: string) {
    setText(exampleText);
    void handleAnalyze(exampleText);
  }

  return (
    <section className="container text-page">
      <div className="moderation-header">
        <h2>Text Moderation Playground</h2>
        <p>
          Analyze written content, review risk signals, and compare ML scoring with
          rule-based matches in one moderation workspace.
        </p>
      </div>

      <div className="text-shell">
        <div className="text-shell-grid">
          <section className="text-input-panel">
            <div className="text-toolbar">
              <button
                type="button"
                className="text-analyze-button"
                onClick={() => void handleAnalyze()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze text"}
              </button>
            </div>

            <div className="text-composer">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type or paste text to moderate..."
              />
            </div>

            <div className="text-example-row">
              {textModerationExamples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  className="text-example-chip"
                  onClick={() => useExample(example.translations.en)}
                >
                  {example.label}
                </button>
              ))}
            </div>

            {error ? <p className="text-panel-error">{error}</p> : null}
          </section>

          <aside className="text-results-panel">
            <div className="text-verdict-card">
              <div>
                <p className="text-verdict-label">Overall verdict</p>
                <h3>{result.verdict}</h3>
                <p className="text-verdict-summary">{result.summary}</p>
              </div>
              <div className="text-verdict-score">
                <span>Risk</span>
                <strong>{result.overallScore}%</strong>
              </div>
            </div>

            <div className="text-results-grid">
              <section className="text-result-card">
                <div className="text-result-head">
                  <h3>ML classes</h3>
                </div>
                <div className="text-score-list">
                  {result.mlScores.map((score) => (
                    <div key={score.label} className="text-score-row">
                      <span>{score.label}</span>
                      <div className="text-score-track">
                        <div
                          className={`text-score-fill${score.tone ? ` ${score.tone}` : ""}`}
                          style={{ width: `${score.value}%` }}
                        />
                      </div>
                      <strong>{score.value}%</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="text-result-card">
                <div className="text-result-head">
                  <h3>Rule filters</h3>
                  <span>{result.ruleScores.filter((score) => score.value > 0).length} active</span>
                </div>
                <div className="text-score-list">
                  {result.ruleScores.map((score) => (
                    <div key={score.label} className="text-score-row">
                      <span>{score.label}</span>
                      <div className="text-score-track">
                        <div
                          className={`text-score-fill${score.tone ? ` ${score.tone}` : ""}`}
                          style={{ width: `${score.value}%` }}
                        />
                      </div>
                      <strong>{score.value}%</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="text-results-grid secondary">
              <section className="text-result-card">
                <div className="text-result-head">
                  <h3>Filter results</h3>
                  <span>{result.filterResults.length} categories</span>
                </div>
                {result.filterResults.length > 0 ? (
                  <div className="text-filter-table">
                    {result.filterResults.map((item) => (
                      <div key={item.category} className="text-filter-row">
                        <span>{item.category}</span>
                        <span>{item.topType}</span>
                        <strong>{item.hits}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-empty-state">No rule-based filters were triggered.</p>
                )}
              </section>

              <section className="text-result-card">
                <div className="text-result-head">
                  <h3>Flagged terms</h3>
                  <span>{result.matches.length} matches</span>
                </div>
                {result.matches.length > 0 ? (
                  <div className="text-match-list">
                    {result.matches.map((match, index) => (
                      <div
                        key={`${match.category}-${match.start}-${index}`}
                        className="text-match-item"
                      >
                        <div>
                          <strong>{match.match}</strong>
                          <p>
                            {match.category} | {match.type}
                            {match.intensity ? ` | ${match.intensity}` : ""}
                          </p>
                        </div>
                        <span>
                          {match.start}-{match.end}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-empty-state">No risky terms matched the configured filters.</p>
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
