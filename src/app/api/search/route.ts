import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { rateLimit } from '@/lib/rate-limit';

// Types for research results
interface ResearchPaper {
  title: string;
  authors: string[];
  year?: string;
  abstract?: string;
  pdfUrl?: string;
  sourceUrl: string;
  source: 'Google Scholar' | 'ResearchGate';
  citations?: number;
  doi?: string;
  journal?: string;
}

// Rate limiter configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

// Headers to mimic browser behavior
const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
};

async function searchGoogleScholar(query: string): Promise<ResearchPaper[]> {
  try {
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=en`;
    const { data } = await axios.get(url, { headers: browserHeaders });
    const $ = cheerio.load(data);
    const papers: ResearchPaper[] = [];

    $('.gs_ri').each((_, element) => {
      // Title and source URL
      const titleElement = $(element).find('.gs_rt a');
      const title = titleElement.text().trim();
      const sourceUrl = titleElement.attr('href') || '';

      // Authors and year
      const authorInfo = $(element).find('.gs_a').text();
      const authors = authorInfo.split('-')[0].split(',').map(a => a.trim());
      const yearMatch = authorInfo.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : undefined;

      // Citations
      const citationsText = $(element).find('.gs_fl').text();
      const citationsMatch = citationsText.match(/Cited by (\d+)/);
      const citations = citationsMatch ? parseInt(citationsMatch[1]) : undefined;

      // PDF URL
      const pdfLink = $(element).find('a').filter((_, el) => {
        const href = $(el).attr('href');
        return href?.endsWith('.pdf') || $(el).text().includes('[PDF]');
      });
      const pdfUrl = pdfLink.attr('href');

      // Abstract
      const abstract = $(element).find('.gs_rs').text().trim();

      papers.push({
        title,
        authors,
        year,
        abstract,
        pdfUrl,
        sourceUrl,
        source: 'Google Scholar',
        citations,
      });
    });

    return papers;
  } catch (error) {
    console.error('Google Scholar search error:', error);
    return [];
  }
}

async function searchResearchGate(query: string): Promise<ResearchPaper[]> {
  try {
    const url = `https://www.researchgate.net/search/publication?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: browserHeaders });
    const $ = cheerio.load(data);
    const papers: ResearchPaper[] = [];

    $('.research-item-main').each((_, element) => {
      // Title and source URL
      const titleElement = $(element).find('.research-item-title');
      const title = titleElement.text().trim();
      const sourceUrl = 'https://www.researchgate.net' + (titleElement.find('a').attr('href') || '');

      // Authors
      const authorElements = $(element).find('.research-item-author');
      const authors = authorElements.map((_, el) => $(el).text().trim()).get();

      // Abstract
      const abstract = $(element).find('.research-item-abstract').text().trim();

      // DOI
      const doiElement = $(element).find('a[href*="doi.org"]');
      const doi = doiElement.attr('href')?.replace('https://doi.org/', '');

      // Journal
      const journal = $(element).find('.research-item-meta').text().trim();

      papers.push({
        title,
        authors,
        abstract,
        sourceUrl,
        source: 'ResearchGate',
        doi,
        journal
      });
    });

    return papers;
  } catch (error) {
    console.error('ResearchGate search error:', error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    try {
      await limiter.check(10, userId); // 10 requests per minute per user
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get search parameters
    const { query, filter } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Perform searches in parallel
    const [scholarResults, rgResults] = await Promise.allSettled([
      searchGoogleScholar(query),
      searchResearchGate(query)
    ]);

    // Combine results
    const results = [
      ...(scholarResults.status === 'fulfilled' ? scholarResults.value : []),
      ...(rgResults.status === 'fulfilled' ? rgResults.value : [])
    ];

    // Apply filters
    const filteredResults = filter === 'pdf_only' 
      ? results.filter(paper => paper.pdfUrl)
      : results;

    // Sort by citations (if available)
    const sortedResults = filteredResults.sort((a, b) => {
      if (!a.citations && !b.citations) return 0;
      if (!a.citations) return 1;
      if (!b.citations) return -1;
      return b.citations - a.citations;
    });

    return NextResponse.json({
      results: sortedResults,
      metadata: {
        total: sortedResults.length,
        withPdf: sortedResults.filter(p => p.pdfUrl).length,
        sources: {
          googleScholar: scholarResults.status === 'fulfilled' ? scholarResults.value.length : 0,
          researchGate: rgResults.status === 'fulfilled' ? rgResults.value.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Research search error:', error);
    return NextResponse.json(
      { error: 'Failed to search for papers' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};