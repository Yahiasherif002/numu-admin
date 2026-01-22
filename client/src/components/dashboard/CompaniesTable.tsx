/**
 * Companies Table Component - NUMU Admin Dashboard
 * 
 * Design: Data table with search, filter, sort, export
 * Based on Figma: 103-485.svg - Companies table
 */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  Download,
  ExternalLink,
  Filter,
  Link2,
  Search,
  Trash2,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  email: string;
  logo: string;
  logoColor: string;
  website: string;
  status: "Active" | "Pending" | "Inactive";
  country: string;
  city: string;
  flag: string;
  categories: { label: string; color: string }[];
}

const companies: Company[] = [
  {
    id: "1",
    name: "Figma",
    email: "company@info.com",
    logo: "F",
    logoColor: "bg-gradient-to-br from-pink-500 to-purple-600",
    website: "https://wunderui.com",
    status: "Active",
    country: "Australia",
    city: "Perth",
    flag: "🇦🇺",
    categories: [
      { label: "design", color: "bg-gray-100 text-gray-600" },
      { label: "development", color: "bg-teal-50 text-teal-600" },
    ],
  },
  {
    id: "2",
    name: "Spotify",
    email: "company@info.com",
    logo: "S",
    logoColor: "bg-green-500",
    website: "https://wunderui.com",
    status: "Active",
    country: "United States",
    city: "New York City",
    flag: "🇺🇸",
    categories: [{ label: "startup", color: "bg-rose-50 text-rose-600" }],
  },
  {
    id: "3",
    name: "Behance",
    email: "company@info.com",
    logo: "Bē",
    logoColor: "bg-blue-600",
    website: "https://wunderui.com",
    status: "Active",
    country: "South Korea",
    city: "Sejong",
    flag: "🇰🇷",
    categories: [{ label: "webdesign", color: "bg-teal-50 text-teal-600" }],
  },
  {
    id: "4",
    name: "Sketch",
    email: "company@info.com",
    logo: "◇",
    logoColor: "bg-amber-500",
    website: "https://wunderui.com",
    status: "Pending",
    country: "Spain",
    city: "Barcelona",
    flag: "🇪🇸",
    categories: [
      { label: "stocks", color: "bg-gray-100 text-gray-600" },
      { label: "crypto", color: "bg-gray-100 text-gray-600" },
    ],
  },
];

export default function CompaniesTable() {
  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Companies</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="search for something"
              className="w-56 pl-9 h-9 text-sm bg-secondary/50 border-0"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="w-10 py-3">
                <Checkbox />
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3">
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3">
                <div className="flex items-center gap-1">
                  Website
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3">
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3">
                <div className="flex items-center gap-1">
                  Country
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3">
                <div className="flex items-center gap-1">
                  Categories
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3">
                <div className="flex items-center gap-1">
                  Options
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3">
                  <Checkbox />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                        company.logoColor
                      )}
                    >
                      {company.logo}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {company.name}
                      </p>
                      <p className="text-xs text-teal-500">{company.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link2 className="w-4 h-4" />
                    {company.website}
                  </div>
                </td>
                <td className="py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      company.status === "Active" &&
                        "bg-emerald-50 text-emerald-600",
                      company.status === "Pending" &&
                        "bg-amber-50 text-amber-600",
                      company.status === "Inactive" && "bg-gray-100 text-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        company.status === "Active" && "bg-emerald-500",
                        company.status === "Pending" && "bg-amber-500",
                        company.status === "Inactive" && "bg-gray-400"
                      )}
                    />
                    {company.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{company.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {company.country}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {company.city}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {company.categories.map((cat, index) => (
                      <span
                        key={index}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                          cat.color
                        )}
                      >
                        {cat.label}
                        <button className="hover:text-foreground">×</button>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
