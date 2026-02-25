import React from 'react';
import { tajwidRules } from '../data/tajwidData';

interface TajwidTextProps {
  text: string;
  className?: string;
}

export default function TajwidText({ text, className = '' }: TajwidTextProps) {
  // Regex to match patterns like [code]text[/code]
  const regex = /\[([a-zA-Z0-9_]+)\](.*?)\[\/\1\]/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    const code = match[1];
    const content = match[2];
    const rule = Object.values(tajwidRules).find(r => r.code === code);

    if (rule) {
      parts.push(
        <span 
          key={`rule-${match.index}`}
          style={{ 
            color: rule.color,
            textShadow: `0 0 10px ${rule.color}40`
          }}
          className="relative inline-block"
        >
          {content}
        </span>
      );
    } else {
      // Fallback if rule not found
      parts.push(<span key={`unknown-${match.index}`}>{content}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return (
    <span className={`font-arabic ${className}`} dir="rtl">
      {parts}
    </span>
  );
}
