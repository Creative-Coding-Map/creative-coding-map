import { format } from 'date-fns/format';
import { useState } from 'react';
import type { CCMBreakdown } from '@/types/ccmap';
import { ExternalLink } from '@/components/external-link';
import { BREAKDOWN_KEYS } from '@/state/constants';
import TagIcon from '@/components/icons/Tag';
import DocumentIcon from '@/components/icons/Document';
import ClockIcon from '@/components/icons/Clock';
import LanguageIcon from '@/components/icons/Language';
import PersonIcon from '@/components/icons/Person';
import MapPinIcon from '@/components/icons/MapPin';
import CloseIcon from '@/components/icons/Close';
import { ActionButton } from '@/components/action-button';
import ExpandIcon from '@/components/icons/Expand';

export default function BreakdownView({ breakdown }: { breakdown: CCMBreakdown }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return isExpanded ? (
        <ExpandedContent breakdown={breakdown} onClose={() => setIsExpanded(false)} />
    ) : (
        <CollapsedContent breakdown={breakdown} setIsExpanded={setIsExpanded} />
    );
}

function CollapsedContent({
    breakdown,
    setIsExpanded,
}: {
    breakdown: CCMBreakdown;
    setIsExpanded: (isExpanded: boolean) => void;
}) {
    return (
        <aside className="relative ccm-card h-64 overflow-hidden flex flex-col" style={{ flex: '0 0 300px' }}>
            <button className="absolute top-4 right-4 btn" onClick={() => setIsExpanded(true)}>
                <ExpandIcon className="ccm-invert size-5" />
            </button>
            <div className="ccm-card-px mb-4 w-5/6">
                <h3 className="type-window-title">{breakdown.title}</h3>
                <p className="type-hint flex items-center gap-1">MATCHING ARTWORK</p>
            </div>
            <img src={breakdown.media[0].url} className="object-cover object-center" alt={breakdown.title} />
        </aside>
    );
}

function ExpandedContent({ breakdown, onClose }: { breakdown: CCMBreakdown; onClose: () => void }) {
    return (
        <aside className="max-w-3xl ml-auto z-20 absolute top-0 right-0 ccm-card h-full overflow-hidden mr-4">
            <ActionButton className="absolute top-4 right-4 btn" onClick={onClose} label="Close">
                <CloseIcon className="ccm-invert" />
            </ActionButton>
            <div className="w-full flex flex-col gap-2 mt-8 h-full overflow-hidden">
                <div className="ccm-card-px flex-shrink-0">
                    <h3 className="type-window-title">{breakdown.title}</h3>
                    <p className="type-hint flex items-center gap-1">SELECTED ARTWORK</p>
                </div>
                <div className="flex border-b-2 border-gray-200 pb-4 ccm-card-px flex-shrink-0">
                    <div className="w-2/3 flex flex-col gap-y-2 mt-4">
                        {renderNodeData(breakdown, 'tags')}
                        {renderNodeData(breakdown, 'useCases')}
                        {renderNodeData(breakdown, 'addedBy')}
                        {renderNodeData(breakdown, 'language')}
                        {renderNodeData(breakdown, 'createdAt')}
                        {renderNodeData(breakdown, 'updatedAt')}
                        {renderNodeData(breakdown, 'country')}
                    </div>
                    <div className="w-1/3 ">
                        <img src={breakdown.media[0].url} alt={breakdown.title} />
                    </div>
                </div>
                <div id="breakdown-description" className="ccm-card-px overflow-y-auto pb-8 flex-1 min-h-0">
                    <p className="type-body mt-4">{breakdown.description}</p>
                    <figure className="mt-4">
                        <img src={breakdown.media[0].url} alt={breakdown.title} className="w-full" />
                        <figcaption className="type-caption mt-2">{breakdown.media[0].caption}</figcaption>
                    </figure>
                </div>
            </div>
        </aside>
    );
}

export type BreakdownKey = keyof typeof BREAKDOWN_KEYS;

function renderIcon(key: keyof CCMBreakdown, className?: string) {
    switch (key) {
        case 'tags':
            return <TagIcon className={className} />;
        case 'useCases':
            return <DocumentIcon className={className} />;
        case 'addedBy':
            return <PersonIcon className={className} />;
        case 'language':
            return <LanguageIcon className={className} />;
        case 'createdAt':
            return <ClockIcon className={className} />;
        case 'updatedAt':
            return <ClockIcon className={className} />;
        case 'country':
            return <MapPinIcon className={className} />;
        default:
            break;
    }
}

function renderNodeData(breakdown: CCMBreakdown, key: BreakdownKey) {
    if (!breakdown[key]) return null;
    return (
        <div className="flex-1 flex">
            <div className="w-5 flex items-center">{renderIcon(key, 'w-[12px] h-[12px]')}</div>
            <div className="w-1/5 type-metadata">{BREAKDOWN_KEYS[key]}</div>
            <ul className="w-2/3 flex flex-wrap gap-y-0.5 gap-x-2">
                {typeof breakdown[key] === 'string' ? (
                    <li className="type-body">
                        {key === 'createdAt' || key === 'updatedAt'
                            ? format(new Date(breakdown[key]), 'MMM d, yyyy hh:mm a')
                            : breakdown[key]}
                    </li>
                ) : (
                    breakdown[key].map((value) =>
                        value.includes('http') ? (
                            <li className="type-link " key={value}>
                                <ExternalLink url={value}>{value}</ExternalLink>
                            </li>
                        ) : (
                            <li className="type-link " key={value}>
                                {value}
                            </li>
                        )
                    )
                )}
            </ul>
        </div>
    );
}
