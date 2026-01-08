/**
 * MathContent: Component để render nội dung có chứa công thức LaTeX.
 *
 * Quy ước:
 * - Văn bản bình thường: hiển thị như text thông thường
 * - Công thức LaTeX: bọc trong $$...$$ (marker quy ước với BE)
 *
 * Ví dụ:
 *   Input: "Cho $$x^2 + y^2 = 1$$ là phương trình..."
 *   Output: "Cho " + [rendered LaTeX] + " là phương trình..."
 */

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathContentProps {
  /** Nội dung có thể chứa $$...$$ markers */
  content: string;
  /** Optional className cho container */
  className?: string;
}

/**
 * Render LaTeX string thành HTML sử dụng KaTeX.
 * Nếu có lỗi parse, trả về text gốc để không crash app.
 */
const renderLatex = (latex: string): string => {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false, // inline mode
      trust: true,
      strict: false,
    });
  } catch (error) {
    console.warn('[MathContent] LaTeX parse error:', error);
    return latex; // Fallback: hiện text gốc
  }
};

/**
 * Parse content và tách thành các phần: plain text và LaTeX.
 *
 * @param content - Nội dung có thể chứa $$...$$
 * @returns Array các object { type: 'text' | 'latex', value: string }
 */
const parseContent = (content: string): Array<{ type: 'text' | 'latex'; value: string }> => {
  const parts: Array<{ type: 'text' | 'latex'; value: string }> = [];

  // Regex: tìm $$...$$
  // [\s\S]*? để match cả newline, *? để non-greedy (dừng sớm nhất)
  const regex = /\$\$([\s\S]*?)\$\$/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Text trước marker $$
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }

    // LaTeX content (bỏ $$)
    parts.push({
      type: 'latex',
      value: match[1],
    });

    lastIndex = regex.lastIndex;
  }

  // Text còn lại sau marker cuối
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  return parts;
};

const MathContent: React.FC<MathContentProps> = ({ content, className }) => {
  // Memoize parsed parts để không parse lại mỗi render
  const parts = useMemo(() => parseContent(content), [content]);

  // Nếu không có LaTeX, render plain text để optimize
  const hasLatex = parts.some((p) => p.type === 'latex');
  if (!hasLatex) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'latex') {
          // Render LaTeX bằng KaTeX
          return (
            <span
              key={index}
              className="math-content"
              dangerouslySetInnerHTML={{ __html: renderLatex(part.value) }}
            />
          );
        }
        // Plain text - giữ nguyên
        return <span key={index}>{part.value}</span>;
      })}
    </span>
  );
};

export default MathContent;
