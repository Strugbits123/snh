import { DollarSign, ExternalLink } from "lucide-react";

const FINANCING = {
  "Sheffield Financial": {
    color: "bg-blue-50 border-blue-200 text-blue-800",
    iconColor: "text-blue-600",
    url: "https://www.sheffieldfinancial.com/",
    label: "Finance with Sheffield Financial",
  },
  "Dealer Direct": {
    color: "bg-green-50 border-green-200 text-green-800",
    iconColor: "text-green-600",
    url: null,
    label: "Finance through Dealer Direct",
  },
};

export default function FinancingBadge({ partner }) {
  const config = FINANCING[partner];
  if (!config) return null;

  const content = (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 mb-4 ${config.color}`}>
      <DollarSign className={`w-5 h-5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Financing Available</p>
        <p className="font-semibold text-sm">{config.label}</p>
      </div>
      {config.url && <ExternalLink className={`w-4 h-4 ${config.iconColor} opacity-60`} />}
    </div>
  );

  if (config.url) {
    return (
      <a href={config.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}