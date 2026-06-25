import React, { useState, useEffect } from 'react';
import { 
  Network, 
  ArrowRight, 
  Server, 
  ShieldCheck, 
  RefreshCw, 
  Activity, 
  Cpu, 
  Globe, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Trash2, 
  HelpCircle,
  Database,
  Lock,
  Unlock,
  Terminal,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function NetworkSimulator() {
  const [activeTab, setActiveTab] = useState<'ports' | 'balancer' | 'security'>('ports');

  // --- 1. PORT MAPPING SIMULATOR STATE ---
  const [userHostPort, setUserHostPort] = useState<number>(8080);
  const [userContainerPort, setUserContainerPort] = useState<number>(3000);
  const [currentMapping, setCurrentMapping] = useState<{ host: number; container: number }>({ host: 8080, container: 3000 });
  const [packetStatus, setPacketStatus] = useState<'idle' | 'traveling-host' | 'traveling-container' | 'success' | 'blocked-host' | 'blocked-container'>('idle');
  const [portLog, setPortLog] = useState<string[]>(['[System] Gateway online... Map ports and test routing.']);
  const [targetHitPort, setTargetHitPort] = useState<number>(8080);

  // --- 2. LOAD BALANCER SIMULATOR STATE ---
  const [lbStrategy, setLbStrategy] = useState<'round-robin' | 'weighted-node-1'>('round-robin');
  const [nodes, setNodes] = useState([
    { id: 1, name: 'Web-Server-App-A (Replica 1)', status: 'online', weight: 3, hits: 0 },
    { id: 2, name: 'Web-Server-App-B (Replica 2)', status: 'online', weight: 1, hits: 0 },
    { id: 3, name: 'Web-Server-App-C (Replica 3)', status: 'online', weight: 1, hits: 0 },
  ]);
  const [activeLBIndex, setActiveLBIndex] = useState<number>(0);
  const [balancingLogs, setBalancingLogs] = useState<string[]>(['[LoadBalancer] Ready to parse incoming workloads.']);
  const [activeRequestNode, setActiveRequestNode] = useState<number | null>(null);

  // --- 3. SECURITY GROUP SIMULATOR STATE ---
  const [dbPortOpened, setDbPortOpened] = useState<boolean>(false);
  const [webAccessOnly, setWebAccessOnly] = useState<boolean>(true);
  const [securityLog, setSecurityLog] = useState<string[]>(['[Firewall] Shield is active. Private subnet isolation turned ON by default.']);
  const [activeAnimPacket, setActiveAnimPacket] = useState<{
    from: 'browser' | 'attacker' | 'web-host';
    to: 'web-server' | 'database';
    status: 'idle' | 'moving' | 'blocked' | 'passed';
  }>({ from: 'browser', to: 'web-server', status: 'idle' });

  // Add automated logs helper
  const addLog = (tabName: 'ports' | 'lb' | 'sec', text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedText = `[${timestamp}] ${text}`;
    if (tabName === 'ports') {
      setPortLog(prev => [formattedText, ...prev].slice(0, 12));
    } else if (tabName === 'lb') {
      setBalancingLogs(prev => [formattedText, ...prev].slice(0, 12));
    } else {
      setSecurityLog(prev => [formattedText, ...prev].slice(0, 12));
    }
  };

  // Run Port Packet Simulation
  const triggerPortPacket = (portInput: number) => {
    setPacketStatus('idle');
    setTargetHitPort(portInput);
    
    setTimeout(() => {
      setPacketStatus('traveling-host');
      addLog('ports', `🌐 Inbound user request pinging Host IP public port :${portInput}...`);

      setTimeout(() => {
        if (portInput === currentMapping.host) {
          setPacketStatus('traveling-container');
          addLog('ports', `✅ Match Found! Host mapped Port :${portInput} is transparently translating packets to container's Port :${currentMapping.container}.`);
          
          setTimeout(() => {
            setPacketStatus('success');
            addLog('ports', `🎉 Success! Container processes received client request inside Port :${currentMapping.container} safely.`);
          }, 800);
        } else if (portInput === currentMapping.container) {
          setPacketStatus('blocked-container');
          addLog('ports', `❌ Blocked! Direct access to container port :${portInput} is denied by the host NAT and security boundary.`);
        } else {
          setPacketStatus('blocked-host');
          addLog('ports', `❌ Failed! No socket listener registered on Host Port :${portInput}. Packet dropped (Connection Refused).`);
        }
      }, 700);
    }, 100);
  };

  const applyPortConfig = () => {
    if (userHostPort < 1 || userHostPort > 65535 || userContainerPort < 1 || userContainerPort > 65535) {
      addLog('ports', `⚠️ Invalid configurations inside port variables. Range must reside between 1 and 65535.`);
      return;
    }
    setCurrentMapping({ host: userHostPort, container: userContainerPort });
    addLog('ports', `⚙️ Container proxy properties updated. Docker port forward rule configured: '-p ${userHostPort}:${userContainerPort}'`);
  };

  // Run Load Balancer Request forwarding
  const fireLBRequests = (count: number) => {
    let currentNodesState = [...nodes];
    let nextIndex = activeLBIndex;

    const runOneRequest = (step: number) => {
      if (step >= count) {
        setNodes(currentNodesState);
        setActiveRequestNode(null);
        return;
      }

      // Find target node based on strategy and status
      const healthyNodes = currentNodesState.filter(n => n.status === 'online');
      if (healthyNodes.length === 0) {
        addLog('lb', `🚨 CRITICAL! All app backend nodes are OFFLINE. Reverse proxy throws [HTTP 502 Bad Gateway] error!`);
        return;
      }

      let targetNodeId = -1;

      if (lbStrategy === 'round-robin') {
        const matchingIndex = nextIndex % healthyNodes.length;
        const target = healthyNodes[matchingIndex];
        targetNodeId = target.id;
        nextIndex = (nextIndex + 1) % healthyNodes.length;
        setActiveLBIndex(nextIndex);
      } else {
        // Weighted nodes
        // App A is node-1, lets route with preference based on weight values
        const rollWeight = Math.random();
        // 70% goes to App A if weighted-node-1 is selected and A is online
        const targetANode = healthyNodes.find(n => n.id === 1);
        if (targetANode && rollWeight < 0.70) {
          targetNodeId = 1;
        } else {
          // Fallback evenly to any other healthy
          const remainingNodes = healthyNodes.filter(n => n.id !== 1);
          if (remainingNodes.length > 0) {
            targetNodeId = remainingNodes[Math.floor(Math.random() * remainingNodes.length)].id;
          } else {
            targetNodeId = healthyNodes[0].id;
          }
        }
      }

      // Animate packet send to the node
      setActiveRequestNode(targetNodeId);
      
      // Update hits inside state
      currentNodesState = currentNodesState.map(n => {
        if (n.id === targetNodeId) {
          return { ...n, hits: n.hits + 1 };
        }
        return n;
      });

      const matchedNode = healthyNodes.find(n => n.id === targetNodeId);
      addLog('lb', `🔀 Proxied request to instance [${matchedNode?.name}] using Strategy: ${lbStrategy.toUpperCase()}`);

      setTimeout(() => {
        runOneRequest(step + 1);
      }, 350);
    };

    runOneRequest(0);
  };

  const toggleNodeStatus = (id: number) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const nextStatus = n.status === 'online' ? 'offline' : 'online';
        addLog('lb', `Node: [${n.name}] status toggled to: ${nextStatus.toUpperCase()}`);
        return { ...n, status: nextStatus };
      }
      return n;
    }));
  };

  const resetLBHits = () => {
    setNodes(prev => prev.map(n => ({ ...n, hits: 0 })));
    addLog('lb', `🔄 Load balancing statistics metrics cleared.`);
  };

  // Run Security Firewall tests
  const testSecurityAvenue = (from: 'browser' | 'attacker' | 'web-host', target: 'web-server' | 'database', destPort: number) => {
    setActiveAnimPacket({ from, to: target, status: 'moving' });
    addLog('sec', `🔍 Diagnostic packet triggered: ${from.toUpperCase()} calling ${target.toUpperCase()} on target port :${destPort}...`);

    setTimeout(() => {
      if (target === 'web-server') {
        // Web server listens on port 80
        if (destPort === 80) {
          setActiveAnimPacket(prev => ({ ...prev, status: 'passed' }));
          addLog('sec', `✅ PASS: Public Web Server successfully accepts connection on HTTP port 80. Security Group allows incoming 0.0.0.0/0 on port 80.`);
        } else {
          setActiveAnimPacket(prev => ({ ...prev, status: 'blocked' }));
          addLog('sec', `❌ BLOCK: Web Server Security Group blocks TCP handshakes on unexpected port :${destPort}.`);
        }
      } else if (target === 'database') {
        // Database rules logic
        if (destPort === 3306) {
          // Check if DB port itself is open
          if (!dbPortOpened) {
            setActiveAnimPacket(prev => ({ ...prev, status: 'blocked' }));
            addLog('sec', `❌ BLOCK: Port Listener Closed. The Database is not even configured to listen on port 3306! Packet dropped.`);
            return;
          }

          // DB port is opened, check who is calling
          if (webAccessOnly) {
            if (from === 'web-host') {
              setActiveAnimPacket(prev => ({ ...prev, status: 'passed' }));
              addLog('sec', `✅ PASS: Database private firewall allows incoming traffic on port 3306, because the requester is our Web-Host container.`);
            } else {
              setActiveAnimPacket(prev => ({ ...prev, status: 'blocked' }));
              addLog('sec', `🛡️ SAFETY ALARM! Security Group BLOCKED request from "${from.toUpperCase()}" target. Access rule says: "ONLY the Web Server Security Group can query this DB on 3306."`);
            }
          } else {
            // Web access restrictions are OFF (Vulnerability active!)
            setActiveAnimPacket(prev => ({ ...prev, status: 'passed' }));
            addLog('sec', `⚠️ VULNERABILITY ALERT! Allowed connection directly from "${from.toUpperCase()}" to your database on 3306! Security Group was set to 0.0.0.0/0 ingress!`);
          }
        } else {
          setActiveAnimPacket(prev => ({ ...prev, status: 'blocked' }));
          addLog('sec', `❌ BLOCK: Database has no services listening on port :${destPort}.`);
        }
      }
    }, 1200);
  };

  return (
    <div className="bg-white border border-indigo-100 shadow-md rounded-2xl overflow-hidden mt-6" id="network-simulator-sandbox">
      {/* Header Panel */}
      <div className="bg-indigo-950/5 p-5 border-b border-indigo-100/95 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-orange-500 animate-pulse" />
            <h3 className="font-sans font-bold text-base text-slate-800">Live Simulator Playground</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Test variables, watch how packets travel, and visualize configurations live inside actions.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button 
            onClick={() => { setActiveTab('ports'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'ports' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/10' : 'text-slate-500 hover:text-slate-800'}`}
          >
            1. Port-Mapping
          </button>
          <button 
            onClick={() => { setActiveTab('balancer'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'balancer' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/10' : 'text-slate-500 hover:text-slate-800'}`}
          >
            2. Load Balancing
          </button>
          <button 
            onClick={() => { setActiveTab('security'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'security' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/10' : 'text-slate-500 hover:text-slate-800'}`}
          >
            3. Firewall VPC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] divide-y lg:divide-y-0 lg:divide-x divide-indigo-100">
        
        {/* LEFT interactive workspace: simulator */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-white">
          
          {/* ======================= T_1. PORT MAPPING WORKSPACE ======================= */}
          {activeTab === 'ports' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-indigo-50/80 gap-2">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="h-4.5 w-4.5 text-indigo-600" /> Container Port Translation
                </span>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100/60 font-medium">
                  Concept: Isolated Container Routing
                </span>
              </div>

              {/* Graphical Packet pipeline */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-slate-200/60 space-y-6 relative overflow-hidden">
                <div className="flex justify-between items-center text-center">
                  
                  {/* Public World */}
                  <div className="flex flex-col items-center z-10 space-y-2">
                    <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center border border-sky-200 text-sky-600 shadow-lg shadow-sky-500/5">
                      <Globe className="h-5 w-5" />
                    </div>

                    <span className="text-xs font-bold text-slate-500">Public Internet</span>
                  </div>

                  {/* Packet visualizer line */}
                  <div className="flex-1 h-1.5 bg-slate-200 mx-4 relative rounded-full">
                    {/* Animated moving packet bullet */}
                    {packetStatus !== 'idle' && (
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full shadow-lg transition-all duration-700 ease-in-out ${
                          packetStatus === 'traveling-host' ? 'bg-amber-500 animate-pulse left-[30%]' :
                          packetStatus === 'blocked-host' ? 'bg-red-500 left-[45%] scale-125' :
                          packetStatus === 'traveling-container' ? 'bg-indigo-600 left-[70%]' :
                          packetStatus === 'blocked-container' ? 'bg-red-500 left-[75%] scale-125' :
                          packetStatus === 'success' ? 'bg-emerald-500 left-[95%] shadow-emerald-500/30' : 'left-0'
                        }`}
                      ></div>
                    )}
                  </div>

                  {/* Physical Host Port Gateway */}
                  <div className="flex flex-col items-center z-10 space-y-2">
                    <div className="h-14 w-24 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 text-slate-800 relative shadow-sm">
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">Host Machine</span>
                      <span className="text-xs font-mono font-extrabold text-orange-600">Port : {currentMapping.host}</span>
                      
                      {/* Subnet wall light indicator */}
                      <div className="absolute -top-1 right-1 h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">Host NAT</span>
                  </div>

                  {/* Connection vector */}
                  <div className="flex-1 h-0.5 border-t-2 border-dashed border-slate-200 mx-4"></div>

                  {/* Container Private App */}
                  <div className="flex flex-col items-center z-10 space-y-2">
                    <div className="h-14 w-28 bg-indigo-50/80 rounded-xl flex flex-col items-center justify-center border border-indigo-150 text-indigo-900 shadow-sm">
                      <span className="text-[9px] text-indigo-600 font-mono font-extrabold uppercase">🐳 Docker Pod</span>
                      <span className="text-xs font-mono font-extrabold text-indigo-700">Port : {currentMapping.container}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">Isolated App</span>
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
                  {packetStatus === 'idle' && (
                    <p className="text-xs text-slate-600 font-medium">Click a test trigger button below to fire custom TCP workload packets.</p>
                  )}
                  {packetStatus === 'traveling-host' && (
                    <p className="text-xs text-amber-600 font-bold animate-pulse">Checking Gateway tables... Routing request.</p>
                  )}
                  {packetStatus === 'blocked-host' && (
                    <p className="text-xs text-rose-600 font-extrabold flex items-center justify-center gap-1 animate-shake">
                      <XCircle className="h-4 w-4 shrink-0" /> Destination Port refused connection. Host is not listening on Port :#{targetHitPort}!
                    </p>
                  )}
                  {packetStatus === 'traveling-container' && (
                    <p className="text-xs text-indigo-700 font-medium">Successful mapping match! Translating packet route internally to container...</p>
                  )}
                  {packetStatus === 'success' && (
                    <p className="text-xs text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4 animate-bounce shrink-0" /> Connection Succeeded! Server running internally answered with [HTTP 200 OK]!
                    </p>
                  )}
                </div>
              </div>

              {/* User Dynamic adjustment controls */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <span className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider font-mono">Configure YAML / CLI Rule:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-500 block font-mono font-bold uppercase">Host (Public Server) Port</label>
                    <input 
                      type="number" 
                      value={userHostPort} 
                      onChange={e => setUserHostPort(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 font-bold rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-500 block font-mono font-bold uppercase">Container (Isolated Application) Port</label>
                    <input 
                      type="number" 
                      value={userContainerPort} 
                      onChange={e => setUserContainerPort(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 font-bold rounded-lg px-3 py-2 text-xs text-slate-850 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100" 
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={applyPortConfig}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Apply Docker Rules
                  </button>
                </div>
              </div>

              {/* Trigger inputs */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">Interact: Test Packet Request Pathway</span>
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => { triggerPortPacket(80); }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-lg text-xs transition-all border border-slate-200 font-mono cursor-pointer"
                  >
                    Send to Port 80
                  </button>
                  <button 
                    onClick={() => { triggerPortPacket(userHostPort); }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 px-3 rounded-lg text-xs transition-all font-mono cursor-pointer shadow-sm shadow-orange-500/15"
                  >
                    Send to Port {userHostPort} (Host Default)
                  </button>
                  <button 
                    onClick={() => { triggerPortPacket(3000); }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-lg text-xs transition-all border border-slate-200 font-mono cursor-pointer"
                  >
                    Send to Port 3000
                  </button>
                </div>
              </div>
            </div>
          )}
             {/* ======================= T_2. LOAD BALANCER REVERSE PROXY ======================= */}
          {activeTab === 'balancer' && (

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-indigo-50/80 gap-2">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Network className="h-4.5 w-4.5 text-emerald-600" /> Nginx Layer 7 Load Balancing
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100/65 font-medium">
                  Concept: Fault Tolerance & Scalability
                </span>
              </div>

              {/* LB architecture visualization */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-slate-200/50 space-y-6">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Traffic source */}
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-700 shadow-sm">
                      <Globe className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">User Pings</span>
                  </div>

                  {/* Flow arrow */}
                  <div className="hidden md:block text-slate-400">
                    <ArrowRight className="h-4 w-4 animate-pulse" />
                  </div>

                  {/* Reverse Proxy central */}
                  <div className="bg-white border-2 border-indigo-500 p-4.5 rounded-2xl flex flex-col items-center text-center w-44 relative shadow-md shadow-indigo-100/30">
                    <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider font-mono">Reverse Proxy</span>
                    <span className="text-xs font-bold text-slate-800 mt-1">Nginx Gateway</span>
                    
                    {/* strategy text */}
                    <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100/50 font-bold font-mono">
                      {lbStrategy === 'round-robin' ? 'Round-Robin' : 'Weighted: App A'}
                    </div>

                    <div className="absolute -bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping"></div>
                  </div>

                  {/* Flow arrow */}
                  <div className="hidden md:block text-slate-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>

                  {/* Target Server Replica set */}
                  <div className="flex-1 w-full space-y-3">
                    {nodes.map(node => (
                      <div 
                        key={node.id} 
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          activeRequestNode === node.id ? 'bg-indigo-50/80 border-indigo-500 scale-[1.02] shadow-sm' :
                          node.status === 'offline' ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-white border-slate-200/80 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-2.5 w-2.5 rounded-full ${node.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-800 block">{node.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Hits handled: <strong className="text-indigo-600 font-bold">{node.hits}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Interactive crash trigger */}
                        <button 
                          onClick={() => toggleNodeStatus(node.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold select-none cursor-pointer transition-colors ${
                            node.status === 'online' 
                              ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {node.status === 'online' ? 'Simulate Kill' : 'Respawn'}
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* LB Controls */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-slate-200/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">Deploy Route Balance Policies:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
                  <button 
                    onClick={() => { setLbStrategy('round-robin'); addLog('lb', '🔄 Balancing mode updated: Round Robin. Traffic will split strictly symmetric across physical nodes.'); }}
                    className={`p-3.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      lbStrategy === 'round-robin' 
                        ? 'bg-indigo-50/65 border-indigo-500 text-indigo-900 shadow-sm font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <strong className="block mb-1 text-slate-800">🔄 Standard Round-Robin</strong>
                    Symmetric load. Sends request 1 to Pod A, request 2 to Pod B, request 3 to Pod C.
                  </button>

                  <button 
                    onClick={() => { setLbStrategy('weighted-node-1'); addLog('lb', '⚖️ Balancing mode updated: Weighted (Node A preference). Pod A is beefier!'); }}
                    className={`p-3.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      lbStrategy === 'weighted-node-1' 
                        ? 'bg-indigo-50/65 border-indigo-500 text-indigo-900 shadow-sm font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <strong className="block mb-1 text-slate-800">⚖️ Weighted Priority (App A)</strong>
                    Best for mismatched sizes. App A is running on 8 CPU cores, others on 2 cores.
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">Trigger test workload:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => fireLBRequests(1)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
                    >
                      <Play className="h-3 w-3" /> Execute 1 Request
                    </button>
                    <button 
                      onClick={() => fireLBRequests(10)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    >
                      <Activity className="h-3 w-3" /> Simulate 10 requests burst
                    </button>
                    <button 
                      onClick={resetLBHits}
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 p-2 rounded-lg transition-all cursor-pointer"
                      title="Clear Analytics Counter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ======================= T_3. VPC SECURITY GROUPS ======================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-indigo-50/80 gap-2">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-rose-600" /> VPC Subnet & Security Shield Sandbox
                </span>
                <span className="text-[11px] bg-red-50 text-rose-700 px-2.5 py-1 rounded-lg border border-red-100/65 font-medium">
                  Concept: Defense-in-depth Core
                </span>
              </div>

              {/* Graphical Network mapping */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 border-slate-200/60 space-y-6 relative overflow-hidden">
                
                {/* Traffic Requesters column */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Requesters list */}
                  <div className="md:col-span-4 space-y-3.5">
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider block font-bold text-center md:text-left">Inbound Sources</span>
                    
                    <button 
                      onClick={() => { testSecurityAvenue('browser', 'web-server', 80); }}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 p-3 rounded-xl text-left text-xs text-slate-800 flex items-center gap-2.5 group transition-all cursor-pointer shadow-xs"
                    >
                      <Globe className="h-4.5 w-4.5 text-sky-500" />
                      <div>
                        <span className="font-extrabold block">Public User</span>
                        <span className="text-[10px] text-slate-500 font-mono">Any IP (0.0.0.0/0)</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => { testSecurityAvenue('web-host', 'database', 3306); }}
                      className="w-full bg-indigo-50/80 border border-indigo-150 hover:bg-indigo-100/70 p-3 rounded-xl text-left text-xs text-indigo-900 flex items-center gap-2.5 group transition-all cursor-pointer shadow-xs"
                    >
                      <Server className="h-4.5 w-4.5 text-indigo-600" />
                      <div>
                        <span className="font-extrabold block">My Web-Container</span>
                        <span className="text-[10px] text-indigo-600 font-mono">Internal subnet IP</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => { testSecurityAvenue('attacker', 'database', 3306); }}
                      className="w-full bg-white border border-rose-200 hover:bg-rose-50/45 p-3 rounded-xl text-left text-xs text-rose-800 flex items-center gap-2.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Terminal className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                      <div>
                        <span className="font-bold text-rose-700 block">External Threat Bot</span>
                        <span className="text-[10px] text-rose-500/80 font-mono">Malicious public source</span>
                      </div>
                    </button>
                  </div>

                  {/* Packet Animation Line */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center">
                    <div className="h-10 w-10 flex items-center justify-center">
                      {activeAnimPacket.status === 'moving' && (
                        <div className="h-5 w-5 rounded-full bg-indigo-600 animate-ping"></div>
                      )}
                      {activeAnimPacket.status === 'blocked' && (
                        <span className="text-rose-700 font-extrabold text-xs bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 scale-[1.02] animate-shake">BLOCKED</span>
                      )}
                      {activeAnimPacket.status === 'passed' && (
                        <span className="text-emerald-700 font-extrabold text-xs bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 scale-[1.02]">PASSED</span>
                      )}
                    </div>
                  </div>

                  {/* Private VPC Cloud boundaries */}
                  <div className="md:col-span-6 bg-white p-4.5 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-mono border-b border-indigo-50/80 pb-2">
                      <span className="text-slate-500 font-bold">🛡️ VIRTUAL PRIVATE CLOUD (VPC)</span>
                      <span className="text-orange-600 font-extrabold uppercase">SECURE REGION</span>
                    </div>

                    {/* Web server component and database */}
                    <div className="space-y-3">
                      
                      {/* Public Front Gate Server */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Public Web Instance</span>
                          <span className="text-[10px] font-mono text-indigo-600 font-semibold">Inbound Rule: ALLOW PORT 80</span>
                        </div>
                        <span className="h-6 w-6 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full flex items-center justify-center text-[10px] font-bold font-mono">80</span>
                      </div>

                      {/* PRIVATE RESTRICTED ZONE FOR DB */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 font-sans">
                            <Database className="h-4 w-4" /> Isolated SQL Database
                          </span>
                          <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100 px-2 rounded-lg font-bold font-mono">Private Subnet</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-600 font-medium">Service active?</span>
                          <button 
                            onClick={() => {
                              setDbPortOpened(!dbPortOpened);
                              addLog('sec', `DB Service listener active toggled to ${!dbPortOpened ? 'ON (running Postgres on port 3306)' : 'OFF (process killed)'}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold font-mono cursor-pointer transition-all ${dbPortOpened ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
                          >
                            {dbPortOpened ? 'Port 3306 Listening' : 'Port Closed'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Ingress Firewall Rules:</span>
                          <button 
                            onClick={() => {
                              setWebAccessOnly(!webAccessOnly);
                              addLog('sec', `Security firewall rules updated. Ingress restrict is now ${!webAccessOnly ? 'STRICT (Web host only on 3306)' : 'INSECURE (anyone allowed on port 3306)'}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${webAccessOnly ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/10' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                          >
                            {webAccessOnly ? 'STRICT (Only Web Instance)' : 'INSECURE (Any Client IP)'}
                          </button>
                        </div>
                      </div>


                    </div>

                  </div>

                </div>

              </div>

              {/* Live interactive guide label */}
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-slate-700 flex items-start gap-2">
                <HelpCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-indigo-600" />
                <div>
                  <strong className="block mb-0.5 text-indigo-900 font-bold">Learn by toggling Security restrictions:</strong>
                  If you toggle <span className="bg-white border border-slate-200 px-1 font-mono text-[10px] rounded font-bold text-slate-800">INSECURE (Any Client IP)</span> rules, test how the "Threat Bot" can directly query your database tables! Bring back <span className="bg-white border border-slate-200 px-1 font-mono text-[10px] rounded font-bold text-slate-800">STRICT (Only Web Instance)</span> to lock hackers safely out while keeping the Web application fully connected. This is what Cloud Network protection does!
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT Column: Active Shell/Telemetry logging system */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-950">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5 uppercase font-bold">
                <Terminal className="h-3.5 w-3.5" /> Live Diagnostic Logs
              </span>
              <button 
                onClick={() => {
                  if (activeTab === 'ports') setPortLog(['[System] Gateway logs initialized.']);
                  else if (activeTab === 'balancer') setBalancingLogs(['[LoadBalancer] Router terminal initialized.']);
                  else setSecurityLog(['[Firewall] Access telemetry initialized.']);
                }}
                className="text-[10px] hover:text-slate-200 text-slate-400 font-mono underline cursor-pointer"
              >
                Clear Output
              </button>
            </div>

            {/* Simulated terminal lines list container */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 font-mono text-[11px] leading-relaxed h-[280px] overflow-y-auto space-y-2">
              {activeTab === 'ports' && portLog.map((log, index) => (
                <div key={index} className={`border-b border-slate-800/40 pb-1.5 last:border-0 ${log.includes('✅') || log.includes('🎉') ? 'text-emerald-400 font-semibold' : log.includes('❌') || log.includes('⚠️') ? 'text-rose-450 text-rose-400 font-semibold' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
              {activeTab === 'balancer' && balancingLogs.map((log, index) => (
                <div key={index} className={`border-b border-slate-800/40 pb-1.5 last:border-0 ${log.includes('⚖️') || log.includes('🗺️') || log.includes('🔀') ? 'text-indigo-300 font-semibold' : log.includes('🚨') ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
              {activeTab === 'security' && securityLog.map((log, index) => (
                <div key={index} className={`border-b border-slate-800/40 pb-1.5 last:border-0 ${log.includes('✅') || log.includes('🛡️') ? 'text-sky-300 font-semibold' : log.includes('🚨') || log.includes('⚠️') || log.includes('❌') ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-sans space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
              <span>All simulation calculations are done immediately client-side.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
              <span>Observe port values or network parameters transition under the hood!</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

