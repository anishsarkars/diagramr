"use client";

export const DataStructuresDiagram = () => {
  return (
    <div className="h-full w-full bg-black p-4 rounded-lg flex flex-col">
      <h2 className="text-white text-3xl mb-8 font-bold text-center">Data Structures</h2>
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* Queue visualization */}
        <div className="flex flex-col items-center">
          <div className="relative flex space-x-1 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={`queue-${i}`} 
                className="w-8 h-20 bg-indigo-500 rounded-sm flex items-center justify-center text-white"
              >
                Data
              </div>
            ))}
            <div className="absolute -left-14 top-10 text-white">Dequeue</div>
            <div className="absolute -right-14 top-10 text-white">Enqueue</div>
            <svg className="absolute -left-10 top-9" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg className="absolute -right-10 top-9 rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Linked List */}
        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-2">
            {[5, 23, 7, 13].map((num, i) => (
              <div key={`node-${i}`} className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i === 0 ? "bg-blue-500" : 
                  i === 1 ? "bg-orange-400" : 
                  i === 2 ? "bg-blue-500" : 
                  "bg-blue-500"
                } text-white font-bold`}>
                  {num}
                </div>
                {i < 3 && (
                  <svg className="absolute -right-4 top-3" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {i === 0 && <div className="absolute -top-6 text-white text-xs">Head</div>}
                {i === 3 && <div className="absolute -top-6 text-white text-xs">Tail</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Binary Tree */}
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-48">
            <div className="absolute left-1/2 -translate-x-1/2 top-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">8</div>
            </div>
            <svg className="absolute left-[70px] top-10" width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M3 17L9 11M21 7L9 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute left-1/4 -translate-x-1/2 top-16">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">7</div>
            </div>
            <div className="absolute left-3/4 -translate-x-1/2 top-16">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">6</div>
            </div>
            <svg className="absolute left-[32px] top-26" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 17L9 11M21 7L9 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute left-1/8 -translate-x-1/2 top-32">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">3</div>
            </div>
            <div className="absolute left-3/8 -translate-x-1/2 top-32">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
            </div>
            <div className="absolute left-5/8 -translate-x-1/2 top-32">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BrainAnatomyDiagram = () => {
  return (
    <div className="h-full w-full bg-black p-4 rounded-lg">
      <div className="relative h-full w-full">
        {/* Brain regions with colors like in the brain diagram */}
        <svg viewBox="0 0 500 300" className="h-full w-full">
          <g transform="translate(50, 30) scale(0.8)">
            {/* Frontal lobe - blue */}
            <path d="M80,120 Q130,80 160,100 L160,180 Q130,190 80,170 Z" fill="#4299e1" stroke="#000" strokeWidth="2" />
            
            {/* Parietal lobe - red */}
            <path d="M160,100 Q200,80 240,100 L240,180 Q200,190 160,180 Z" fill="#f56565" stroke="#000" strokeWidth="2" />
            
            {/* Temporal lobe - yellow */}
            <path d="M80,170 Q130,190 160,180 L180,230 Q140,240 90,220 Z" fill="#ecc94b" stroke="#000" strokeWidth="2" />
            
            {/* Occipital lobe - green */}
            <path d="M240,100 Q280,80 300,120 L300,170 Q270,190 240,180 Z" fill="#48bb78" stroke="#000" strokeWidth="2" />
            
            {/* Cerebellum - purple */}
            <path d="M240,180 Q270,190 300,170 L310,220 Q270,240 230,220 Z" fill="#9f7aea" stroke="#000" strokeWidth="2" />
            
            {/* Brain stem */}
            <path d="M230,220 Q270,240 310,220 L320,260 Q270,280 220,260 Z" fill="#d6bcfa" stroke="#000" strokeWidth="2" />
            
            {/* Labels */}
            <text x="115" y="140" fontSize="12" fill="white">FRONTAL LOBE</text>
            <text x="190" y="140" fontSize="12" fill="white">PARIETAL LOBE</text>
            <text x="130" y="210" fontSize="12" fill="white">TEMPORAL LOBE</text>
            <text x="260" y="140" fontSize="12" fill="white">OCCIPITAL</text>
            <text x="260" y="200" fontSize="12" fill="white">CEREBELLUM</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export const MarketingStackDiagram = () => {
  return (
    <div className="h-full w-full bg-white p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Marketing Technology Stack Diagram</h3>
      <div className="flex justify-between space-x-1 mb-6">
        {["Awareness", "Website", "Data Management", "Engagement", "Interaction", "Measurement"].map((stage, i) => (
          <div key={stage} className="flex-1">
            <div className="h-12 flex items-center justify-center px-2 bg-gray-100 border border-gray-300 text-sm font-medium text-center">
              {stage}
            </div>
            <div className="mt-2 bg-orange-400 p-2 border border-orange-500 h-10 text-white text-center text-xs flex items-center justify-center">
              {i % 2 === 0 ? "Social" : "Analytics"}
            </div>
            <div className="mt-1 bg-blue-500 p-2 border border-blue-600 h-10 text-white text-center text-xs flex items-center justify-center">
              {i % 2 === 0 ? "Ads" : "CRM"}
            </div>
            <div className="mt-1 bg-orange-400 p-2 border border-orange-500 h-10 text-white text-center text-xs flex items-center justify-center">
              {i % 2 === 0 ? "Webinar" : "Email"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdobeConnectDiagram = () => {
  return (
    <div className="h-full w-full bg-white p-4 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-xl font-bold text-center mb-2">Adobe Connect</div>
        
        {/* Center devices */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-12 h-10 border-2 border-gray-700 rounded"></div>
          <div className="w-14 h-12 border-2 border-gray-700 rounded flex items-center justify-center">
            <div className="w-10 h-8 border-2 border-gray-700"></div>
          </div>
          <div className="w-8 h-12 border-2 border-gray-700 rounded"></div>
        </div>
        
        {/* Adobe connect logo */}
        <div className="w-12 h-12 bg-green-600 flex items-center justify-center text-white text-xs font-bold">
          AC
        </div>
        
        {/* Connected features */}
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="h-16 w-32 rounded-full border-2 border-black flex items-center justify-center text-center text-xs">
            Record and Maintain Course
          </div>
          <div className="h-16 w-32 rounded-full border-2 border-black flex items-center justify-center text-center text-xs">
            Online Collaboration
          </div>
          <div className="h-16 w-32 rounded-full border-2 border-black flex items-center justify-center text-center text-xs">
            Content Sharing
          </div>
        </div>
      </div>
    </div>
  );
}; 