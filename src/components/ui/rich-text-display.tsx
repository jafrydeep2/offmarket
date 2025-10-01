import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div 
      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none ${className}`}
      style={{
        '--tw-prose-bullets': 'hsl(var(--primary))',
        '--tw-prose-counters': 'hsl(var(--primary))',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
