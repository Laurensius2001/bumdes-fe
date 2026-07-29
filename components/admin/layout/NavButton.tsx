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

  // Render badge with specific colors based on text (just for visual flair matching the mockup)
  const renderBadge = (badgeStr: string) => {
    let colorClass = 'bg-[#1a1c32] text-[#8e93be]';
    if (badgeStr.includes('Gbps')) colorClass = 'bg-[#0e3b33] text-[#00e5b0]';
    if (badgeStr.includes('Belum')) colorClass = 'bg-[#3b2b18] text-[#f59e0b]';
    if (badgeStr === 'POS') colorClass = 'bg-[#311f58] text-[#c084fc]';

    return (
      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
        {badgeStr}
      </span>
    );
  };

  if (navItem.collapsible) {
    return (
      <div className="mb-2">
        <button
          onClick={() => setChecked(!checked)}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors ${
            isActive
              ? 'bg-gradient-to-r from-[#6b42ff] to-[#8a42ff] text-white shadow-lg shadow-[#6b42ff]/30'
              : 'text-gray-400 hover:bg-[#1f243d] hover:text-white'
          }`}
          title={isCollapsed ? navItem.title : ''}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <IconifyIcon icon={navItem.icon as string} className="text-xl shrink-0" />
            {!isCollapsed && (
              <span className="truncate text-[14px] font-medium">{navItem.title}</span>
            )}
          </div>
          {!isCollapsed && (
            <IconifyIcon icon={checked ? 'mingcute:up-fill' : 'mingcute:down-fill'} className="text-sm shrink-0" />
          )}
        </button>
        {!isCollapsed && (
          <Collapse in={checked} className="w-full">
            <div className="mt-1 flex flex-col gap-1 pl-4">
              {navItem.sublist?.map((subListItem: any, idx: number) => {
                const isSubActive = pathname === `${navItem.path}/${subListItem.path}`;
                return (
                  <Link
                    key={idx}
                    href={`${navItem.path}/${subListItem.path}`}
                    className={`rounded-lg px-3 py-2 text-[13px] transition-colors ${
                      isSubActive ? 'bg-[#3a3b3c] text-white' : 'text-gray-500 hover:bg-[#1f243d] hover:text-white'
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
      className={`mb-2 flex items-center justify-between rounded-xl px-3 py-3 transition-colors ${
        isActive
          ? 'bg-gradient-to-r from-[#6b42ff] to-[#8a42ff] text-white shadow-lg shadow-[#6b42ff]/30'
          : 'text-gray-400 hover:bg-[#1f243d] hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <IconifyIcon icon={navItem.icon as string} className="text-[20px] shrink-0" />
        {!isCollapsed && (
          <span className="truncate text-[14px] font-medium">{navItem.title}</span>
        )}
      </div>
      {!isCollapsed && navItem.badge && renderBadge(navItem.badge)}
    </Link>
  );
};

export default NavButton;
