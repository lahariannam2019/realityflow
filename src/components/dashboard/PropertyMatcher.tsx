import React from 'react';
import { Property, LeadAnalysis } from '@/lib/types';
import { CheckCircle2, MapPin, Building, Tag, IndianRupee, XCircle, Sparkles } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/utils';
import Link from 'next/link';

interface PropertyMatcherProps {
  analysis: LeadAnalysis | null;
  properties: Property[];
}

export default function PropertyMatcher({ analysis, properties }: PropertyMatcherProps) {
  if (!analysis) return null;

  const extractNumber = (str: string | null) => {
    if (!str) return null;
    const matches = str.match(/\d+(\.\d+)?/);
    return matches ? parseFloat(matches[0]) : null;
  };

  // Safe lowercasing
  const extractLocation = (analysis.extracted_location || '').toLowerCase();
  const extractType = (analysis.extracted_property_type || '').toLowerCase();
  const extractBHK = extractNumber(analysis.extracted_bhk);
  
  // Available properties only
  const activeProperties = properties.filter(
    (p) => p.status === 'active' && p.is_published !== false && p.availability === 'available'
  );

  const matchedProperties = activeProperties.map((p) => {
    let score = 0;
    const matchReasons: string[] = [];
    const missReasons: string[] = [];

    // Location Match
    if (extractLocation && p.location.toLowerCase().includes(extractLocation)) {
      score += 30;
      matchReasons.push(`Location matches: ${p.location}`);
    } else if (extractLocation) {
      missReasons.push(`Location differs (Client wants ${analysis.extracted_location}, Property is ${p.location})`);
    }

    // Type Match
    if (extractType && p.property_type.toLowerCase().includes(extractType)) {
      score += 30;
      matchReasons.push(`Property type matches: ${p.property_type}`);
    } else if (extractType) {
      missReasons.push(`Type differs (Client wants ${analysis.extracted_property_type}, Property is ${p.property_type})`);
    }

    // BHK Match
    if (extractBHK && p.bedrooms === extractBHK) {
      score += 20;
      matchReasons.push(`BHK matches perfectly (${p.bedrooms} BHK)`);
    } else if (extractBHK && p.bedrooms) {
      if (Math.abs(p.bedrooms - extractBHK) <= 1) {
        score += 10;
        matchReasons.push(`BHK is close (${p.bedrooms} BHK vs requested ${extractBHK} BHK)`);
      } else {
        missReasons.push(`BHK differs significantly (${p.bedrooms} BHK vs requested ${extractBHK})`);
      }
    }

    // Budget check (rough heuristic)
    const budgetStr = (analysis.extracted_budget || '').toLowerCase();
    let budgetValue = extractNumber(budgetStr) || 0;
    if (budgetStr.includes('cr') || budgetStr.includes('crore')) budgetValue *= 10000000;
    else if (budgetStr.includes('lakh') || budgetStr.includes('lac')) budgetValue *= 100000;

    if (budgetValue > 0) {
      if (p.price <= budgetValue * 1.2) { // Allow 20% stretch
        score += 20;
        matchReasons.push(`Price (${formatIndianCurrency(p.price)}) is within 20% of stated budget (${analysis.extracted_budget})`);
      } else {
        missReasons.push(`Price (${formatIndianCurrency(p.price)}) is over budget (${analysis.extracted_budget})`);
      }
    }

    return { property: p, score, matchReasons, missReasons };
  })
  .filter((m) => m.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3); // Top 3 matches

  if (matchedProperties.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          AI Property Matching
        </h3>
        <p className="text-xs text-stone-500">No available properties closely match the extracted requirements.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        AI Suggested Properties
      </h3>
      <div className="space-y-4">
        {matchedProperties.map((match) => (
          <div key={match.property.id} className="border border-stone-100 bg-stone-50/50 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-stone-800 text-sm">{match.property.title}</h4>
                <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.property.location}</span>
                  <span className="flex items-center gap-1"><Building className="w-3 h-3" />{match.property.property_type}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{formatIndianCurrency(match.property.price)}</span>
                </div>
              </div>
              <Link 
                href={`/properties/${match.property.id}`} 
                target="_blank"
                className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                View Property
              </Link>
            </div>
            
            <div className="space-y-1.5 mt-3 pt-3 border-t border-stone-200/60">
              {match.matchReasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{reason}</span>
                </div>
              ))}
              {match.missReasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
