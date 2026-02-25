import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  leftIcon?: string;
  onLeftClick?: () => void;
  rightIcon?: string;
  onRightClick?: () => void;
  showNotificationDot?: boolean;
  className?: string;
}

export default function Header({
  title,
  leftIcon,
  onLeftClick,
  rightIcon,
  onRightClick,
  showNotificationDot = false,
  className,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick();
    } else if (leftIcon === 'arrow_back' || leftIcon === 'arrow_back_ios_new') {
      navigate(-1);
    }
  };

  const isBackIcon = leftIcon === 'arrow_back' || leftIcon === 'arrow_back_ios_new';

  return (
    <header className={clsx("flex items-center justify-between px-4 py-2 sticky top-0 bg-background-dark/60 backdrop-blur-xl z-50 border-b border-white/5", className)}>
      {isBackIcon ? (
        <button 
          onClick={handleLeftClick}
          className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-slate-200">{leftIcon}</span>
        </button>
      ) : leftIcon ? (
        <button 
          onClick={handleLeftClick}
          className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-slate-200">{leftIcon}</span>
        </button>
      ) : (
        <div className="size-10"></div>
      )}
      
      <div className="flex-1 flex justify-center">
        {title && <h1 className="text-white font-bold text-base tracking-wide">{title}</h1>}
      </div>
      
      {rightIcon && rightIcon !== 'notifications' ? (
        <button 
          onClick={onRightClick}
          className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors relative active:scale-95"
        >
          <span className="material-symbols-outlined text-slate-200">{rightIcon}</span>
          {showNotificationDot && (
            <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full shadow-[0_0_8px_rgba(16,183,72,0.8)]"></span>
          )}
        </button>
      ) : (
        <div className="size-10"></div>
      )}
    </header>
  );
}
