import React, { useState, useEffect } from 'react';
import { AppScreen, UserProfile, SimulatedUserData, Product } from './types';
import { Button } from './components/Button';
import { getPersonalizedRecommendations } from './services/geminiService';
import { 
  ShieldCheck, 
  Lock, 
  MessageSquare, 
  Users, 
  ShoppingBag, 
  LogOut, 
  Sparkles,
  ChevronRight,
  Search,
  Bell,
  Menu
} from 'lucide-react';

// --- Components ---

// 1. Login Screen
const LoginScreen = ({ onLogin }: { onLogin: (user: UserProfile) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({ name: "Alex Mercer", email: "alex@example.com" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-white">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-200">
          <ShoppingBag className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">ShopSense AI</h1>
        <p className="text-zinc-500">Your personal shopping assistant.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
          <input 
            type="email" 
            defaultValue="alex@example.com"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
          <input 
            type="password" 
            defaultValue="password123"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="pt-4">
          <Button type="submit" isLoading={loading}>Sign In</Button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-xs text-zinc-400">
        By signing in, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
};

// 2. Permission Request Screen
const PermissionScreen = ({ onGrant, onSkip }: { onGrant: () => void, onSkip: () => void }) => {
  const [isGranting, setIsGranting] = useState(false);

  const handleGrant = () => {
    setIsGranting(true);
    // Simulate native permission dialog delay
    setTimeout(() => {
      onGrant();
      setIsGranting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="flex-1 px-6 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative">
          <ShieldCheck className="w-10 h-10 text-indigo-600" />
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
            <Lock className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Supercharge your results</h2>
        <p className="text-zinc-600 mb-8 leading-relaxed">
          To provide truly personalized recommendations, ShopSense needs temporary access to analyze your recent trends.
        </p>

        <div className="w-full space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-zinc-100 text-left">
            <div className="bg-blue-100 p-2 rounded-lg shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Message Analysis</h3>
              <p className="text-xs text-zinc-500 mt-1">We look for keywords like "hiking", "birthday", or "coffee" to suggest relevant items.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-zinc-100 text-left">
            <div className="bg-purple-100 p-2 rounded-lg shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Contact Network</h3>
              <p className="text-xs text-zinc-500 mt-1">We identify shared interests within your circle to find trending gifts.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-100 rounded-lg text-xs text-zinc-500 mb-8 text-left w-full">
          <strong>Privacy Note:</strong> Your raw data never leaves your device permanently. We only extract anonymized keywords to query our recommendation engine.
        </div>
      </div>

      <div className="p-6 bg-white border-t border-zinc-100 safe-area-bottom">
        <Button onClick={handleGrant} isLoading={isGranting} className="mb-3">
          Allow Access
        </Button>
        <Button variant="outline" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
};

// 3. Dashboard Screen
const DashboardScreen = ({ user, hasPermissions, onLogout }: { user: UserProfile, hasPermissions: boolean, onLogout: () => void }) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<SimulatedUserData | null>(null);

  // MOCK DATA GENERATOR: Simulates what the app "found" on the phone
  const generateSimulatedData = (): SimulatedUserData => {
    // Randomize scenarios for demo variety
    const scenarios = [
      {
        recentMessages: [
          "Hey, are we still going hiking this weekend?",
          "My back is killing me from that old office chair.",
          "Looking for a gift for Mom's birthday, she loves tea."
        ],
        contactInterests: ["Outdoor Enthusiasts", "Home Office Workers", "Tea Lovers"]
      },
      {
        recentMessages: [
          "Just started training for the marathon!",
          "I need to track my sleep better, any app suggestions?",
          "Can you send me that smoothie recipe?"
        ],
        contactInterests: ["Runners", "Bio-hackers", "Health Nuts"]
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  useEffect(() => {
    const fetchRecs = async () => {
      if (hasPermissions) {
        setIsLoading(true);
        const simData = generateSimulatedData();
        setAnalyzedData(simData);
        
        // Call Gemini
        const products = await getPersonalizedRecommendations(simData);
        setRecommendations(products);
        setIsLoading(false);
      } else {
        // Fallback generic products
        setRecommendations([
          { id: '1', name: 'Premium Wireless Earbuds', description: 'High fidelity sound.', price: 149, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/earbuds/400/400' },
          { id: '2', name: 'Classic Leather Wallet', description: 'Timeless design.', price: 59, category: 'Accessories', imageUrl: 'https://picsum.photos/seed/wallet/400/400' },
        ]);
      }
    };

    fetchRecs();
  }, [hasPermissions]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900">ShopSense</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-full">
            <Search className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-zinc-200 rounded-full overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            Hello, {user.name.split(' ')[0]}
          </h1>
          <p className="text-zinc-500">Here's what we found for you today.</p>
        </div>

        {/* Data Analysis Summary (Only if permissions granted) */}
        {hasPermissions && analyzedData && (
          <div className="bg-indigo-900 text-white rounded-2xl p-5 mb-8 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-indigo-300 text-xs font-medium uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> AI Insights Active
              </div>
              <p className="text-sm text-indigo-100 mb-2">
                Based on your recent chats about 
                <span className="text-white font-semibold"> "{analyzedData.contactInterests[0]}"</span> and 
                <span className="text-white font-semibold"> "{analyzedData.contactInterests[1]}"</span>...
              </p>
              <div className="h-1 w-20 bg-indigo-500 rounded-full mt-4"></div>
            </div>
          </div>
        )}

        {!hasPermissions && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex items-start gap-3">
             <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
             <div>
               <h3 className="text-sm font-semibold text-orange-900">Personalization is off</h3>
               <p className="text-xs text-orange-700 mt-1 mb-2">Enable contact & message access to get AI-curated finds tailored to your life.</p>
               <button onClick={onLogout} className="text-xs font-medium text-orange-600 underline">Check Settings</button>
             </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900">
              {hasPermissions ? 'Curated For You' : 'Trending Now'}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-zinc-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-zinc-100 group">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 relative">
                     <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-zinc-900 shadow-sm">
                      ${product.price}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-medium text-indigo-600 mb-1">{product.category}</div>
                    <h3 className="font-bold text-zinc-900 text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{product.description}</p>
                    
                    {product.matchReason && (
                      <div className="flex items-start gap-2 bg-indigo-50 p-3 rounded-lg">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-800 italic">"{product.matchReason}"</p>
                      </div>
                    )}
                    
                    <button className="w-full mt-4 py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Settings / Logout fixed button */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={onLogout}
          className="bg-white text-zinc-600 p-4 rounded-full shadow-xl shadow-zinc-200 border border-zinc-100 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


// Main App Controller
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Simple Router
  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={(u) => {
          setUser(u);
          setCurrentScreen(AppScreen.PERMISSIONS);
        }} />;
      case AppScreen.PERMISSIONS:
        return <PermissionScreen 
          onGrant={() => {
            setHasPermissions(true);
            setCurrentScreen(AppScreen.DASHBOARD);
          }}
          onSkip={() => {
            setHasPermissions(false);
            setCurrentScreen(AppScreen.DASHBOARD);
          }}
        />;
      case AppScreen.DASHBOARD:
        return user ? (
          <DashboardScreen 
            user={user} 
            hasPermissions={hasPermissions} 
            onLogout={() => {
              setUser(null);
              setHasPermissions(false);
              setCurrentScreen(AppScreen.LOGIN);
            }} 
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="antialiased text-zinc-900 bg-zinc-100 min-h-screen font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
}