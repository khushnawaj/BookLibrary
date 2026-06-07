import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  let last = 0;
  const items = [];
  for (const p of visiblePages) {
    if (last && p - last > 1) {
      items.push('...');
    }
    items.push(p);
    last = p;
  }

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        id="pagination-prev"
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {items.map((item, i) =>
        item === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(item)}
            className="h-8 w-8 text-sm"
            id={`pagination-page-${item}`}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        id="pagination-next"
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
