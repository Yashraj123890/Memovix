import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal, dependency-free markdown-to-React renderer.
 *
 * The AI Workspace has no streaming/tabular content to render — every
 * report (summary, requirements, comparison, scope) comes from a prompt
 * (see server/src/ai/prompts/*.prompt.ts) that explicitly asks the model
 * for headings, bullet lists and bold section labels, nothing more exotic
 * (no tables or images). Rather than adding react-markdown + remark-gfm as
 * new dependencies for that narrow surface, this hand-rolls the block/
 * inline rules those prompts actually produce — `#`/`##`/`###` headings,
 * `-`/`*`/`+` bullet lists, `1.` ordered lists, `---` rules, `> ` block
 * quotes, fenced ``` code blocks, plain paragraphs, and inline `**bold**` /
 * `` `code` `` — plus blockquotes/code fences defensively, in case a report
 * ever includes one even though the prompts don't ask for them. Anything
 * outside this grammar still renders as plain text — it never throws on
 * unexpected input.
 */

export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; lines: string[] }
  | { type: "code"; content: string; language?: string }
  | { type: "rule" }
  | { type: "paragraph"; text: string };

/** Parses raw markdown text into the block grammar described above — exported so callers that need to group blocks by heading (e.g. the Comparison report's colored sections) can work from the same parse instead of re-implementing it. */
export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listOrdered = false;
  let quoteBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  }

  function flushList() {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", ordered: listOrdered, items: listBuffer });
      listBuffer = [];
    }
  }

  function flushQuote() {
    if (quoteBuffer.length > 0) {
      blocks.push({ type: "blockquote", lines: quoteBuffer });
      quoteBuffer = [];
    }
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    const codeFenceMatch = /^```\s*(\w*)\s*$/.exec(trimmed);
    if (codeFenceMatch) {
      flushAll();
      const language = codeFenceMatch[1] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "```") {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", content: codeLines.join("\n"), language });
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      flushAll();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      flushAll();
      blocks.push({ type: "rule" });
      continue;
    }

    const quoteMatch = /^>\s?(.*)$/.exec(trimmed);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteBuffer.push(quoteMatch[1]);
      continue;
    }
    flushQuote();

    const bulletMatch = /^[-*+]\s+(.*)$/.exec(trimmed);
    const orderedMatch = bulletMatch ? null : /^\d+[.)]\s+(.*)$/.exec(trimmed);
    const listMatch = bulletMatch ?? orderedMatch;

    if (listMatch) {
      flushParagraph();
      const isOrdered = Boolean(orderedMatch);
      if (listBuffer.length > 0 && listOrdered !== isOrdered) {
        flushList();
      }
      listOrdered = isOrdered;
      listBuffer.push(listMatch[1].trim());
      continue;
    }

    // A bold-only line (e.g. "**Recommendations**") acts as a sub-heading
    // in this output style even though it's not a real "#" heading.
    const boldOnlyMatch = /^\*\*(.+)\*\*:?$/.exec(trimmed);
    if (boldOnlyMatch) {
      flushAll();
      blocks.push({ type: "heading", level: 3, text: boldOnlyMatch[1].trim() });
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushAll();

  return blocks;
}

/** Renders `**bold**` and `` `code` `` spans inside a single line of text. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*.+?\*\*|`.+?`)/g).filter((token) => token !== "");

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    const boldMatch = /^\*\*(.+)\*\*$/.exec(token);
    if (boldMatch) {
      return (
        <strong key={key} className="text-foreground font-semibold">
          {boldMatch[1]}
        </strong>
      );
    }
    const codeMatch = /^`(.+)`$/.exec(token);
    if (codeMatch) {
      return (
        <code key={key} className="bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]">
          {codeMatch[1]}
        </code>
      );
    }
    return <React.Fragment key={key}>{token}</React.Fragment>;
  });
}

const HEADING_CLASSES: Record<1 | 2 | 3, string> = {
  1: "text-foreground text-lg font-semibold",
  2: "text-foreground text-base font-semibold",
  3: "text-foreground text-sm font-semibold",
};

/**
 * Renders a list of already-parsed blocks — shared by renderMarkdown
 * (whole-document case) and any caller that groups blocks itself (e.g.
 * Comparison's per-section coloring). Headings after the first block get a
 * top border + extra spacing so multi-section reports read as distinct
 * sections rather than one undifferentiated wall of text.
 */
export function renderBlocks(blocks: Block[], keyPrefix = "block"): React.ReactNode[] {
  return blocks.map((block, index) => {
    const key = `${keyPrefix}-${index}`;

    if (block.type === "heading") {
      return (
        <p
          key={key}
          className={cn(HEADING_CLASSES[block.level], index > 0 && "border-border/50 mt-1 border-t pt-3")}
        >
          {renderInline(block.text, key)}
        </p>
      );
    }

    if (block.type === "rule") {
      return <hr key={key} className="border-border" />;
    }

    if (block.type === "blockquote") {
      return (
        <blockquote key={key} className="border-primary/30 text-muted-foreground flex flex-col gap-1 border-l-4 pl-4 text-sm italic">
          {block.lines.map((line, lineIndex) => (
            <span key={`${key}-line-${lineIndex}`}>{renderInline(line, `${key}-${lineIndex}`)}</span>
          ))}
        </blockquote>
      );
    }

    if (block.type === "code") {
      return (
        <pre key={key} className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">
          <code className="font-mono whitespace-pre">{block.content}</code>
        </pre>
      );
    }

    if (block.type === "list") {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag key={key} className={listClassName(block.ordered)}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`} className="text-muted-foreground text-sm leading-relaxed">
              {renderInline(item, `${key}-${itemIndex}`)}
            </li>
          ))}
        </ListTag>
      );
    }

    return (
      <p key={key} className="text-muted-foreground text-sm leading-relaxed">
        {renderInline(block.text, key)}
      </p>
    );
  });
}

/** Renders an AI-generated markdown report using the hand-rolled parser above. */
export function renderMarkdown(markdown: string): React.ReactNode {
  const blocks = parseBlocks(markdown);

  if (blocks.length === 0) {
    return null;
  }

  return <div className="flex flex-col gap-3 break-words">{renderBlocks(blocks)}</div>;
}

function listClassName(ordered: boolean): string {
  return ordered
    ? "list-decimal space-y-1.5 pl-5 marker:text-muted-foreground/70"
    : "list-disc space-y-1.5 pl-5 marker:text-muted-foreground/70";
}
