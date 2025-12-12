import React from 'react';
import { CardData, StatType } from '../types';
import { Zap, Star, TrendingUp, Activity, Grid, ArrowDown, Loader2, Target } from 'lucide-react';
import { soundManager } from '../services/soundService';

interface CardProps {
  data: CardData;
  hidden?: boolean;
  onSelectStat?: (stat: StatType) => void;
  disabled?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  animationType?: 'enter' | 'reveal';
  highlightStat?: StatType | null;
  processingLabel?: string | null;
}

const Card: React.FC<CardProps> = ({ data, hidden, onSelectStat, disabled, isWinner, isLoser, animationType = 'enter', highlightStat, processingLabel }) => {
  // Responsive dimensions
  // Increased min-height to ensure content fits without cramping
  // Added overflow handling logic
  const animationClass = animationType === 'reveal' ? 'animate-card-reveal' : 'animate-card-enter';

  const containerClasses = `
    w-[85vw] max-w-[320px] md:w-80 lg:w-96
    h-[60vh] min-h-[480px] md:h-[36rem] lg:h-[40rem]
    bg-theme-panel border-4 flex flex-col relative transition-all duration-300 rounded-theme overflow-hidden box-border
    ${!hidden ? animationClass : ''} 
    ${isWinner ? 'border-theme-success animate-glow-pulse scale-105 z-10' : ''}
    ${isLoser ? 'border-theme-danger opacity-80 grayscale scale-95' : 'border-theme-border shadow-theme'}
    ${!isWinner && !isLoser && !disabled ? 'hover:-translate-y-2 hover:border-theme-primary hover:shadow-[0_0_15px_var(--primary)]' : ''}
  `;

  if (hidden) {
    return (
      <div className={`${containerClasses} items-center justify-center group overflow-hidden`}>
        {/* Dynamic Theme Pattern Background */}
        <div 
            className="absolute inset-0 pointer-events-none"
            style={{
                opacity: 0.15,
                backgroundImage: `
                    linear-gradient(to bottom, transparent 50%, var(--bg) 50%),
                    linear-gradient(90deg, var(--border) 1px, transparent 1px),
                    linear-gradient(var(--border) 1px, transparent 1px)
                `,
                backgroundSize: '100% 4px, 20px 20px, 20px 20px'
            }}
        ></div>

        {/* Diagonal Accent Stripes (Primary Color) */}
        <div 
            className="absolute inset-0 pointer-events-none"
            style={{
                opacity: 0.1,
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, var(--primary) 10px, var(--primary) 12px)`
            }}
        ></div>
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-theme-bg/80 pointer-events-none"></div>
        
        {processingLabel ? (
            <>
               {/* Scanning Line Animation */}
               <div className="absolute left-0 right-0 h-1 bg-theme-primary shadow-[0_0_15px_var(--primary)] animate-scan-line z-10"></div>
               
               {/* Central Processing Label */}
               <div className="z-20 bg-theme-bg/90 px-6 py-3 border-2 border-theme-primary rounded-theme shadow-theme flex items-center gap-3 backdrop-blur-sm transition-all duration-300">
                   <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-theme-primary animate-spin" />
                   <span className="text-theme-primary font-pixel text-xs md:text-sm tracking-widest text-glow animate-pulse">
                      {processingLabel}
                   </span>
               </div>
            </>
        ) : (
            <>
                <div className="text-theme-muted font-pixel text-2xl md:text-3xl 2xl:text-5xl animate-pulse tracking-widest text-center text-glow z-10">
                  UNKNOWN<br/>ENTITY
                </div>
                <div className="absolute bottom-4 text-xs md:text-sm lg:text-lg font-retro text-theme-muted z-10">WAITING FOR REVEAL...</div>
            </>
        )}
      </div>
    );
  }

  // Updated stats with new strategic attributes (6 stats total)
  const stats: { id: StatType; label: string; icon: React.ReactNode; value: number; rawValue?: string }[] = [
    { 
      id: 'followersScore', 
      label: 'FOLLOWERS', 
      icon: <Zap className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />, 
      value: data.followersScore,
      rawValue: `${data.followers} raw`
    },
    { 
      id: 'repositoriesScore', 
      label: 'REPOS', 
      icon: <Star className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />, 
      value: data.repositoriesScore,
      rawValue: `${data.public_repos} raw`
    },
    { 
      id: 'influenceScore', 
      label: 'INFLUENCE', 
      icon: <TrendingUp className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />, 
      value: data.influenceScore,
      rawValue: data.repoStats ? `${data.repoStats.totalStars}★ ${data.repoStats.totalForks}⑂` : undefined
    },
    { 
      id: 'activityScore', 
      label: 'ACTIVITY', 
      icon: <Activity className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />, 
      value: data.activityScore,
      rawValue: data.repoStats ? `${data.repoStats.recentCommits} recent` : undefined
    },
    { 
      id: 'techBreadth', 
      label: 'TECH BREADTH', 
      icon: <Grid className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />, 
      value: data.techBreadth,
      rawValue: data.languageStats ? `${data.languageStats.languageCount} langs` : undefined
    },
    { 
      id: 'impactScore', 
      label: 'IMPACT', 
      icon: <Target className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />, 
      value: data.impactScore,
      rawValue: `${data.seniority}y exp, ${data.public_gists} gists`
    },
  ];

  // Check if this is a "foil" card (4+ stats at 100)
  const perfectStats = stats.filter(s => s.value === 100).length;
  const isFoilCard = perfectStats >= 4;

  const handleMouseEnter = () => {
    if (!disabled && !isWinner && !isLoser) {
      soundManager.playHover();
    }
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      className={`${containerClasses} ${isFoilCard && !hidden ? 'foil-card' : ''}`}
    >
      {/* FOIL BADGE for rare cards */}
      {isFoilCard && !hidden && (
        <div className="foil-badge font-pixel">
          ★ {perfectStats}/6 ★
        </div>
      )}

      {/* VIGNETTE FOR LOSER */}
      {isLoser && (
        <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]"></div>
      )}

      {/* WINNER ARROW INDICATOR */}
      {isWinner && (
        <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-50">
           <ArrowDown className="text-theme-success drop-shadow-lg w-10 h-10 md:w-12 md:h-12 2xl:w-20 2xl:h-20" fill="currentColor" />
           <span className="font-pixel text-theme-success text-[10px] md:text-xs lg:text-lg bg-theme-bg px-2 border-2 border-theme-success rounded-theme">WINNER</span>
        </div>
      )}

      {/* Header / Nameplate */}
      <div className={`h-10 md:h-12 2xl:h-20 flex shrink-0 items-center justify-between px-3 2xl:px-6 border-b-4 
        ${isWinner ? 'bg-theme-success/20 border-theme-success' : (isLoser ? 'bg-theme-danger/20 border-theme-danger' : 'bg-theme-bg border-theme-border')}`}>
        <h3 className="font-pixel text-xs md:text-sm lg:text-xl truncate text-theme-text w-full">{data.login}</h3>
        {isWinner && <span className="font-pixel text-[10px] md:text-xs lg:text-lg text-theme-success animate-pulse text-glow">WIN</span>}
      </div>

      {/* Character Image Area - flexible shrink to prioritize stats on very small screens */}
      <div className="h-32 md:h-40 2xl:h-64 shrink-1 min-h-[100px] bg-[#000] relative border-b-4 border-theme-border group">
        <div className="absolute inset-0 bg-gradient-to-t from-theme-panel to-transparent opacity-50"></div>
        <img 
          src={data.avatar_url} 
          alt={data.login} 
          className="w-full h-full object-cover image-pixelated"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute bottom-2 right-2 bg-theme-bg/90 px-2 py-1 text-[10px] lg:text-base font-pixel text-theme-primary border border-theme-primary rounded-theme shadow-sm">
          LVL.{Math.min(99, Math.floor(data.public_repos / 5) + 1)}
        </div>
      </div>

      {/* Stats Block - Scrollable if content overflows */}
      <div className="flex-1 p-2 md:p-3 2xl:p-6 flex flex-col bg-theme-panel min-h-0 overflow-y-auto">
        <div className="text-[10px] md:text-xs lg:text-base font-retro text-theme-muted mb-2 uppercase tracking-wider border-b border-dashed border-theme-border pb-1 flex justify-between shrink-0">
          <span className="truncate max-w-[60%]">{data.name || 'Anonymous'}</span>
          <span>{data.created_at.substring(0,4)}</span>
        </div>
        
        <div className="flex-1 grid grid-cols-3 gap-2 content-start pb-1">
          {stats.map((stat, index) => {
             const isStatHighlighted = highlightStat === stat.id;
             return (
              <button
                key={stat.id}
                onClick={() => {
                  if(!disabled && onSelectStat) {
                    soundManager.playSelect();
                    onSelectStat(stat.id);
                  }
                }}
                disabled={disabled}
                onMouseEnter={() => !disabled && soundManager.playHover()}
                title={stat.rawValue}
                className={`flex flex-col items-start justify-center px-2 2xl:px-4 py-1.5 2xl:py-3 border-2 transition-all duration-200 group rounded-theme relative overflow-hidden min-h-[60px] md:min-h-[70px] lg:min-h-[80px]
                  ${disabled 
                    ? 'border-transparent cursor-default' 
                    : 'border-theme-border bg-theme-bg hover:bg-theme-primary/20 hover:border-theme-primary hover:scale-[1.02] cursor-pointer active:translate-y-0.5 hover:shadow-[0_0_8px_var(--primary)]'
                  }
                  ${isWinner && !isStatHighlighted ? 'bg-theme-success/10 border-theme-success/50' : ''}
                  ${isStatHighlighted 
                      ? (isWinner 
                          ? '!bg-theme-success !border-theme-success !text-theme-bg shadow-[0_0_20px_var(--success)] scale-105 z-20 animate-pulse' 
                          : (isLoser 
                              ? '!bg-theme-danger !border-theme-danger !text-theme-bg shadow-[0_0_20px_var(--danger)] scale-105 z-20' 
                              : '!bg-theme-accent !border-theme-accent !text-theme-bg shadow-[0_0_20px_var(--accent)] scale-105 z-20'))
                      : ''
                  }
                `}
              >
                <span className={`flex items-center gap-1 font-pixel text-[9px] md:text-[10px] lg:text-sm ${disabled && !isStatHighlighted ? 'text-theme-muted' : (isStatHighlighted ? 'text-theme-bg' : 'text-theme-text group-hover:text-theme-primary')}`}>
                  {stat.icon}
                  <span className="truncate">{stat.label}</span>
                </span>
                <span className={`font-retro text-lg md:text-xl lg:text-3xl ${disabled && !isStatHighlighted ? 'text-theme-muted' : (isStatHighlighted ? 'text-theme-bg' : 'text-theme-text group-hover:text-theme-primary')} mt-0.5`}>
                  {stat.value}
                </span>
                {stat.rawValue && !disabled && (
                  <span className="text-[7px] md:text-[8px] lg:text-xs text-theme-muted/60 mt-0.5 leading-tight">
                    {stat.rawValue}
                  </span>
                )}
              </button>
          )})}
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="h-4 2xl:h-8 shrink-0 bg-theme-border flex items-center justify-center gap-1">
        <div className="w-1 h-1 2xl:w-2 2xl:h-2 bg-theme-panel/50 rounded-full"></div>
        <div className="w-1 h-1 2xl:w-2 2xl:h-2 bg-theme-panel/50 rounded-full"></div>
        <div className="w-1 h-1 2xl:w-2 2xl:h-2 bg-theme-panel/50 rounded-full"></div>
      </div>
    </div>
  );
};

export default Card;