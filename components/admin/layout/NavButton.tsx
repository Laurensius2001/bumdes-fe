import { ReactElement, useState } from 'react';
import { Collapse, LinkTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import IconifyIcon from '@/components/common/IconifyIcon';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/lib/data/nav-items';
import Link from 'next/link';

interface NavItemProps {
  navItem: NavItem;
  Link: OverridableComponent<LinkTypeMap>;
  isCollapsed?: boolean;
}

const NavButton = ({ navItem, isCollapsed }: NavItemProps): ReactElement => {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  
  const isActive = pathname === navItem.path;

  // Render badge with specific colors based on text (matching the mockup HTML)
  const renderBadge = (badgeStr: string) => {
    let colorClass = 'bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full';
    if (badgeStr.includes('Gbps')) colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2 py-0.5 rounded-full';
    if (badgeStr.includes('Belum')) colorClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full';
    if (badgeStr === 'POS') colorClass = 'bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded';

    return (
      <span className={`ml-auto ${colorClass}`}>
        {badgeStr}
      </span>
    );
  };

  if (navItem.collapsible) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setChecked(!checked)}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
          }`}
          title={isCollapsed ? navItem.title : ''}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <IconifyIcon icon={navItem.icon as string} className="text-lg w-5 text-center shrink-0" />
            {!isCollapsed && (
              <span className="truncate">{navItem.title}</span>
            )}
          </div>
          {!isCollapsed && (
            <IconifyIcon icon={checked ? 'mingcute:up-fill' : 'mingcute:down-fill'} className="text-xs shrink-0" />
          )}
        </button>
        {!isCollapsed && (
          <Collapse in={checked} className="w-full">
            <div className="mt-1 flex flex-col gap-1 pl-3.5">
              {navItem.sublist?.map((subListItem: any, idx: number) => {
                const isSubActive = pathname === `${navItem.path}/${subListItem.path}`;
                return (
                  <Link
                    key={idx}
                    href={`${navItem.path}/${subListItem.path}`}
                    className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                      isSubActive ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    {subListItem.title}
                  </Link>
                );
              })}
            </div>
          </Collapse>
        )}
      </div>
    );
  }

  return (
    <Link
      href={navItem.path}
      title={isCollapsed ? navItem.title : ''}
      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs'
          : 'text-slate-400 hover:bg-slate-900/80 hover:text-white border border-transparent'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <IconifyIcon icon={navItem.icon as string} className={`text-lg w-5 text-center shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
        {!isCollapsed && (
          <span className="truncate">{navItem.title}</span>
        )}
      </div>
      {!isCollapsed && navItem.badge && renderBadge(navItem.badge)}
    </Link>
  );
};

export default NavButton;
