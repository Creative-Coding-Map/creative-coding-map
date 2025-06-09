import { createRoute, useNavigate } from '@tanstack/react-router';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { ExternalLink } from '@/components/external-link';
import { Shell } from '@/components/shell';
import { HomeRoute } from '@/routes';
import { BREAKDOWN_KEYS } from '@/state/constants';
import TagIcon from '@/components/icons/Tag';
import DocumentIcon from '@/components/icons/Document';
import ClockIcon from '@/components/icons/Clock';
import LanguageIcon from '@/components/icons/Language';
import PersonIcon from '@/components/icons/Person';
import MapPinIcon from '@/components/icons/MapPin';
import CloseIcon from '@/components/icons/Close';

interface Breakdown {
    id: string;
    title: string;
    tags: string[];
    useCases: string[];
    addedBy: string;
    language: string;
    createdAt: string;
    updatedAt: string;
    country: string;
    media: {
        type: string;
        url: string;
        caption: string;
    }[];
    description: string;
}

const BRKD: Breakdown = {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    tags: [faker.word.noun(), faker.word.noun()],
    useCases: [faker.word.noun(), faker.word.noun()],
    addedBy: faker.person.fullName(),
    language: faker.word.noun(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.past().toISOString(),
    country: faker.location.country(),
    media: [{ type: 'image', url: 'https://picsum.photos/seed/picsum/800/600', caption: faker.lorem.sentence() }],
    description: faker.lorem.paragraphs(8),
};

export const BreakdownRoute = createRoute({
    getParentRoute: () => HomeRoute,
    path: '/breakdown/$id',
    component: BreakdownView,
});

export default function BreakdownView() {
    const { id } = BreakdownRoute.useParams();

    console.log(id);
    const navigate = useNavigate();

    return (
        <Shell className="ccm-pt" onOutsideClick={() => navigate({ to: '/' })}>
            <aside className="max-w-screen-md ml-auto z-20 relative ccm-page ccm-py">
                <button className="absolute top-4 right-4 btn ccm-invert" onClick={() => navigate({ to: '/' })}>
                    <CloseIcon />
                </button>
                <div className="w-full flex flex-col gap-2 mt-8">
                    <div>
                        <h3 className="type-window-title">{BRKD.title}</h3>
                        <p className="type-hint flex items-center gap-1">SELECTED ARTWORK</p>
                    </div>
                    <div className="flex">
                        <div className="w-2/3 flex flex-col gap-y-2 mt-4">
                            {renderNodeData(BRKD, 'tags')}
                            {renderNodeData(BRKD, 'useCases')}
                            {renderNodeData(BRKD, 'addedBy')}
                            {renderNodeData(BRKD, 'language')}
                            {renderNodeData(BRKD, 'createdAt')}
                            {renderNodeData(BRKD, 'updatedAt')}
                            {renderNodeData(BRKD, 'country')}
                            <p className="type-body mt-4">{BRKD.description}</p>
                        </div>
                        <div className="w-1/3 ">
                            <img src={BRKD.media[0].url} alt={BRKD.title} />
                        </div>
                    </div>
                    <figure className="mt-4">
                        <img src={BRKD.media[0].url} alt={BRKD.title} className="w-full" />
                        <figcaption className="type-caption mt-2">{BRKD.media[0].caption}</figcaption>
                    </figure>
                </div>
            </aside>
        </Shell>
    );
}

export type BreakdownKey = keyof typeof BREAKDOWN_KEYS;

function renderIcon(key: BreakdownKey, className?: string) {
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

function renderNodeData(breakdown: Breakdown, key: BreakdownKey) {
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
