import React from 'react';
import { GraduationCap, BookOpen, Layers, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">Skill Exchange</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Academic Hub & Semester Resource Library connecting students across engineering branches.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 text-xs text-indigo-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Person 1 (Kala) Module
            </div>
          </div>

          {/* Academic Years */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Academic Years</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/resources?year=Year+I" className="hover:text-indigo-400 transition-colors">
                  Year I (Semesters 1 & 2)
                </Link>
              </li>
              <li>
                <Link to="/resources?year=Year+II" className="hover:text-indigo-400 transition-colors">
                  Year II (Semesters 3 & 4)
                </Link>
              </li>
              <li>
                <Link to="/resources?year=Year+III" className="hover:text-indigo-400 transition-colors">
                  Year III (Semesters 5 & 6)
                </Link>
              </li>
              <li>
                <Link to="/resources?year=Year+IV" className="hover:text-indigo-400 transition-colors">
                  Year IV (Semesters 7 & 8)
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Branches */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Engineering Branches</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/resources?branch=CSE" className="hover:text-indigo-400 transition-colors">
                  Computer Science (CSE)
                </Link>
              </li>
              <li>
                <Link to="/resources?branch=IT" className="hover:text-indigo-400 transition-colors">
                  Information Technology (IT)
                </Link>
              </li>
              <li>
                <Link to="/resources?branch=ECE" className="hover:text-indigo-400 transition-colors">
                  Electronics & Comm (ECE)
                </Link>
              </li>
              <li>
                <Link to="/resources?branch=EEE" className="hover:text-indigo-400 transition-colors">
                  Electrical & Electronics (EEE)
                </Link>
              </li>
              <li>
                <Link to="/resources?branch=ME" className="hover:text-indigo-400 transition-colors">
                  Mechanical Engineering (ME)
                </Link>
              </li>
              <li>
                <Link to="/resources?branch=CE" className="hover:text-indigo-400 transition-colors">
                  Civil Engineering (CE)
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>MongoDB Authentication & Access Control</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Personalized Student Dashboard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Study Notes, PDFs & PYQ Archive</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Persistent Student Bookmarks</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Peer Reviews & 5-Star Ratings</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Skill Exchange — Core Platform: Authentication, Dashboard & Semester Resources.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted for academic excellence with MongoDB, Express & React.
          </p>
        </div>
      </div>
    </footer>
  );
};
