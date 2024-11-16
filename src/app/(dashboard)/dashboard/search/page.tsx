// src/app/(dashboard)/dashboard/search/page.tsx
'use client';

import { useState } from 'react';
import { 
  Search, Book, Download, ExternalLink, 
  Info, Filter, ArrowUpRight, Loader2 
} from 'lucide-react';

interface SearchResult {
  title: string;
  authors: string[];
  year: string;
  abstract: string;
  pdfUrl?: string;
  sourceUrl: string;
  source: 'Google Scholar' | 'ResearchGate';
  citations?: number;
  aiSummary?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pdf_only'>('all');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filter: activeFilter })
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateAISummary = async (resultId: string) => {
    setIsGeneratingSummary(resultId);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: results.find(r => r.title === resultId)?.title,
          abstract: results.find(r => r.title === resultId)?.abstract
        })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      
      const { summary } = await response.json();
      setResults(prev => prev.map(result => 
        result.title === resultId 
          ? { ...result, aiSummary: summary }
          : result
      ));
    } catch (error) {
      console.error('AI summary error:', error);
    } finally {
      setIsGeneratingSummary(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Academic Search</h1>
        <p className="text-gray-500">
          Search across academic papers and research publications
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for research papers..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filter:</span>
          </div>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilter === 'all'
                ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                : 'hover:bg-gray-100'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveFilter('pdf_only')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilter === 'pdf_only'
                ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                : 'hover:bg-gray-100'
            }`}
          >
            PDF Available
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result) => (
            <div
              key={result.title}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF6B6B]/30 transition-colors"
            >
              {/* Title and Source */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-lg font-semibold">
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF6B6B] flex items-center gap-2"
                  >
                    {result.title}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  {result.source === 'Google Scholar' ? (
                    <Book className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-500">{result.source}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{result.authors.join(', ')}</span>
                <span>•</span>
                <span>{result.year}</span>
                {result.citations && (
                  <>
                    <span>•</span>
                    <span>{result.citations} citations</span>
                  </>
                )}
              </div>

              {/* Abstract */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {result.abstract}
              </p>

              {/* AI Summary */}
              {result.aiSummary && (
                <div className="bg-[#FF6B6B]/5 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-[#FF6B6B] font-medium mb-2">
                    <Info className="w-4 h-4" />
                    AI Summary
                  </div>
                  <p className="text-gray-600 text-sm">
                    {result.aiSummary}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {result.pdfUrl && (
                  <a
                    href={result.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B6B] text-white hover:opacity-90 transition-opacity text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
                {!result.aiSummary && (
                  <button
                    onClick={() => generateAISummary(result.title)}
                    disabled={isGeneratingSummary === result.title}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B6B]/10 text-[#FF6B6B] hover:bg-[#FF6B6B]/20 transition-colors text-sm"
                  >
                    {isGeneratingSummary === result.title ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4" />
                        Generate AI Summary
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {query && !isSearching && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}