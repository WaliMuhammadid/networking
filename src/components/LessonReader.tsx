import React, { useState } from 'react';
import { LearningModule } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  Code, 
  Terminal, 
  Check, 
  ExternalLink,
  ChevronRight,
  Info,
  Server,
  Database,
  Globe,
  Lock,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface LessonReaderProps {
  module: LearningModule;
}

export default function LessonReader({ module }: LessonReaderProps) {
  const [activePortTooltip, setActivePortTooltip] = useState<string | null>(null);

  // Custom visual diagram helpers depending on topic
  const renderInteractiveTopicDiagram = (type?: string) => {
    switch (type) {
      case 'ports': {
        const commonPorts = [
          { port: 22, name: 'SSH', usage: 'Remote terminal control for VPS servers. Always restrict this to developer IP!' },
          { port: 80, name: 'HTTP', usage: 'Standard insecure web traffic. Redirects immediately to port 443.' },
          { port: 443, name: 'HTTPS', usage: 'Secure encrypted web protocol (SSL/TLS). This is where standard web page requests go!' },
          { port: 3306, name: 'MySQL', usage: 'Database server communication. Never publish this to the public world!' },
          { port: 8080, name: 'Dev Alternative', usage: 'Common alternative port for running backend APIs (FastAPI, Java Spring, Node).' },
        ];
        return (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 uppercase font-mono">
              <Info className="h-4 w-4 text-indigo-600" /> Interactive Port Directory (Click a port to learn)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {commonPorts.map(item => (
                <button
                  key={item.port}
                  onClick={() => setActivePortTooltip(activePortTooltip === item.name ? null : item.name)}
                  className={`px-3.5 py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    activePortTooltip === item.name
                      ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  :{item.port} ({item.name})
                </button>
              ))}
            </div>
            {activePortTooltip && (
              <div className="bg-white border border-indigo-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed shadow-sm">
                <strong className="text-indigo-600">💡 Docker & Production Relevance:</strong>{' '}
                {commonPorts.find(i => i.name === activePortTooltip)?.usage}
              </div>
            )}
          </div>
        );
      }

      case 'bridge':
        return (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">Typical Docker Bridge Network Topology:</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
              {/* Container 1 */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col items-center shadow-xs">
                <span className="text-[10px] font-mono text-indigo-600 font-extrabold block">frontend-service</span>
                <span className="text-[11px] text-slate-600 font-mono mt-0.5">IP: 172.18.0.2</span>
              </div>
              
              {/* Bridge visual routing */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-150 text-xs shadow-xs">
                <span className="text-[10px] text-indigo-700 font-bold uppercase block">docker0 (Virtual Switch)</span>
                <span className="text-slate-600 italic">Routes packets internally using software interfaces</span>
              </div>

              {/* Container 2 */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col items-center shadow-xs">
                <span className="text-[10px] font-mono text-orange-600 font-extrabold block">mongodb-database</span>
                <span className="text-[11px] text-slate-600 font-mono mt-0.5">IP: 172.18.0.3</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center leading-relaxed font-medium">Because both live inside the <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600">docker0</code> switch, the frontend can fetch MongoDB directly on <code className="text-emerald-600 font-bold">172.18.0.3:27017</code> without any public internet delay.</p>
          </div>
        );

      case 'proxy':
        return (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center space-y-3">
            <span className="text-xs font-bold text-slate-700 block text-left uppercase tracking-wider font-mono">Reverse Proxy Traffic Gateway:</span>
            
            <div className="flex justify-between items-center max-w-md mx-auto py-2">
              <div className="h-8 px-2 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-mono text-slate-700 shadow-xs font-semibold">
                🌐 Public Client
              </div>

              <div className="text-slate-400">
                <ArrowRight className="h-4 w-4" />
              </div>

              <div className="h-10 px-3 bg-indigo-600 rounded-lg flex flex-col items-center justify-center text-[11px] font-mono text-white shadow-sm font-bold">
                <strong className="block">Nginx Gate</strong>
                <span className="text-[9px] text-indigo-200">Routes to /api</span>
              </div>
              <div className="text-slate-400">
                <ArrowRight className="h-4 w-4" />
              </div>

              <div className="h-8 px-2 bg-white border border-indigo-150 rounded flex items-center justify-center text-[10px] font-mono text-indigo-600 shadow-xs font-semibold">
                📂 Node Pod List
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-left leading-relaxed">The public user only knows about NginXs external domain name. NginX serves public caches locally, while forwarding custom database queries dynamically downstream.</p>
          </div>
        );

      case 'dns-trace':
        return (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">How a Domain resolves to an IP (DNS Propagation hierarchy):</span>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-sky-700">
                <span className="bg-white w-5 h-5 flex items-center justify-center rounded border border-slate-200 font-bold">1</span>
                <span>My browser queries: "What is mywebsite.com?"</span>
              </div>
              <div className="pl-7 flex items-center gap-2 text-indigo-700">
                <span className="bg-white w-5 h-5 flex items-center justify-center rounded border border-slate-200 font-bold">2</span>
                <span>Recursive DNS server requests Root Nameserver (".")</span>
              </div>
              <div className="pl-7 flex items-center gap-2 text-purple-700">
                <span className="bg-white w-5 h-5 flex items-center justify-center rounded border border-slate-200 font-bold font-bold">3</span>
                <span>TLD server (".com") points to Domain Zone record</span>
              </div>
              <div className="pl-7 flex items-center gap-2 text-emerald-700">
                <span className="bg-white w-5 h-5 flex items-center justify-center rounded border border-slate-200 font-bold">4</span>
                <span>A Record returned: "123.45.67.89". Browser connects!</span>
              </div>
            </div>
          </div>
        );

      case 'vpc-sg':
        return (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-rose-600" /> VPC Isolation Zones:
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/60 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide block">Public Subnet Domain</span>
                <p className="text-[10px] text-slate-600 leading-relaxed">Contains reverse proxies, static CDN gateways, and Bastion/Jump hosts. Has attached internet gateway access.</p>
              </div>

                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide block">Private Subnet Domain</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed">Contains PostgreSQL, MongoDB cluster databases, secret storage nodes, microservices. Locked away completely from world routers.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id={`lesson-module-view-${module.id}`}>
      
      {/* Intro Hero Section */}
      <div className="bg-slate-900 bg-gradient-to-tr from-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-950/20 relative overflow-hidden shadow-sm text-white">
        <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/5 blur-3xl rounded-full"></div>
        
        <div className="flex items-center gap-2.5 text-xs text-indigo-300 font-mono tracking-wider uppercase">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Active Course Module • {module.estimatedTime} read</span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-2">{module.title}</h2>
        <p className="text-xs font-semibold text-indigo-200 mt-1">{module.subtitle}</p>
        <p className="text-xs text-slate-300 leading-relaxed mt-3.5 italic border-l-2 border-orange-500/65 pl-3">
          "{module.description}"
        </p>
      </div>

      {/* Main concepts container layout */}
      <div className="space-y-6">
        {module.concepts.map((concept, index) => (
          <div 
            key={index} 
            className="bg-white border border-indigo-100 shadow-sm rounded-2xl p-5 md:p-6 space-y-4 shadow-xs"
          >
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              {concept.title}
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {concept.text}
            </p>

            {/* Custom Interactive Concept Tooltip and Diagrams */}
            {concept.diagramType && renderInteractiveTopicDiagram(concept.diagramType)}

            {concept.bulletPoints && concept.bulletPoints.length > 0 && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {concept.bulletPoints.map((bullet, bIdx) => (
                  <li 
                    key={bIdx} 
                    className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200/50"
                  >
                    <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                    <span className="font-semibold">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* DevOps Relevance Case Study - EXPLANATORY CORE FOR DEVOPS PRACTITIONERS */}
      <div className="bg-indigo-50/50 border border-indigo-100/70 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
            <Code className="h-4.5 w-4.5 text-indigo-600 font-bold" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 font-mono">DevOps Target Blueprint</h4>
            <p className="text-xs font-semibold text-slate-600">Production Scenario & Practical Solutions</p>
          </div>
        </div>

        {/* Real Scenario */}
        <div className="space-y-3.5 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-orange-600 font-extrabold tracking-wider uppercase block font-mono">⚠️ Devops Scenario Challenge:</span>
            <p className="text-slate-700 mt-1 leading-relaxed font-semibold">{module.devopsRelevance.scenario}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-indigo-600 uppercase tracking-wider block font-bold font-mono">🔑 Why this saves the infrastructure:</span>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{module.devopsRelevance.whyItMatters}</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-orange-600 uppercase tracking-wider block font-bold font-mono">🔧 Practical Tool used:</span>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-semibold">{module.devopsRelevance.practicalTool}</p>
            </div>
          </div>
        </div>

        {/* Example Config highlight code block */}
        {module.devopsRelevance.exampleCode && (
          <div className="space-y-20-px space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">{module.devopsRelevance.exampleCodeTitle || 'Production Config Snippet:'}</span>
            <div className="relative group">
              <div className="absolute right-3 top-3 bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 uppercase border border-slate-700">
                {module.devopsRelevance.exampleCodeLanguage || 'Code'}
              </div>
              <pre className="bg-slate-950 text-slate-150 text-slate-200 font-mono text-xs overflow-x-auto p-4.5 rounded-xl border border-slate-900 shadow-inner">
                <code>{module.devopsRelevance.exampleCode}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

