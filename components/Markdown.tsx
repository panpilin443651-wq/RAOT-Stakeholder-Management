import React from "react";

/** ตัวแสดงผล Markdown อย่างย่อ รองรับหัวข้อ ย่อหน้า รายการ ตาราง และ blockquote */
export default function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: React.ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index++;
      continue;
    }

    // ตาราง
    if (line.trim().startsWith("|") && lines[index + 1]?.includes("---")) {
      const header = splitRow(line);
      index += 2;
      const body: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        body.push(splitRow(lines[index]));
        index++;
      }
      blocks.push(
        <div key={key++} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-raot-700 text-white">
                {header.map((cell, i) => (
                  <th key={i} className="border border-raot-800 px-3 py-2 text-left font-medium">
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className="odd:bg-white even:bg-raot-50/40">
                  {row.map((cell, c) => (
                    <td key={c} className="border border-[var(--line)] px-3 py-2 align-top">
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // หัวข้อ
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = inline(heading[2]);
      const className =
        level <= 2
          ? "mt-7 mb-3 text-[17px] font-semibold text-raot-800 first:mt-0"
          : "mt-5 mb-2 text-[15px] font-medium text-raot-700";
      blocks.push(
        React.createElement(`h${Math.min(level + 1, 6)}`, { key: key++, className }, text),
      );
      index++;
      continue;
    }

    // blockquote
    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="my-4 border-l-4 border-raot-300 bg-raot-50 px-4 py-2.5 text-[var(--ink-muted)]"
        >
          {inline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    // รายการลำดับเลข
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s/, ""));
        index++;
      }
      blocks.push(
        <ol key={key++} className="my-3 list-decimal space-y-1.5 pl-6">
          {items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // รายการหัวข้อย่อย
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s/, ""));
        index++;
      }
      blocks.push(
        <ul key={key++} className="my-3 list-disc space-y-1.5 pl-6">
          {items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // ย่อหน้า
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,4}\s|>|[-*]\s|\d+\.\s|\|)/.test(lines[index])) {
      paragraph.push(lines[index]);
      index++;
    }
    blocks.push(
      <p key={key++} className="my-3 leading-[1.9]">
        {inline(paragraph.join(" "))}
      </p>,
    );
  }

  return <div className="max-w-4xl">{blocks}</div>;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** รองรับ **ตัวหนา** เท่านั้น */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <b key={i} className="font-semibold text-raot-800">
        {part.slice(2, -2)}
      </b>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}
