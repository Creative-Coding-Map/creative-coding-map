import { createElement } from 'react';
import clsx from 'clsx';
import WebIcon from './icons/Web';
import WikipediaIcon from './icons/Wikipedia';
import GithubIcon from './icons/Github';
import { ExternalLink } from './external-link';
import ExpandIcon from './icons/Expand';

const ICON_CLASSNAME = 'ccm-transition-fast';

function RenderUrlIcon({ url }: { url: string }) {
    if (url.includes('wikipedia')) return <WikipediaIcon className={clsx(ICON_CLASSNAME, 'size-4')} />;
    if (url.includes('github')) return <GithubIcon className={clsx(ICON_CLASSNAME, 'size-4')} />;
    return <WebIcon className={clsx(ICON_CLASSNAME, 'size-4')} />;
}

export function Link({
    url,
    label,
    as,
    className,
}: {
    url: string;
    label: string;
    as: 'li' | 'span' | 'div';
    className?: string;
}) {
    const props = {
        key: url,
        className: clsx(
            'cursor-pointer relative ellipsis flex items-center gap-2 ccm-border p-1 pr-6 rounded-md hover:bg-light-gray hover:border-light-gray dunkel:hover:text-black ccm-transition-fast group',
            className
        ),
    };
    return createElement(
        as,
        props,
        <RenderUrlIcon url={url} />,
        <ExternalLink url={url}>{label}</ExternalLink>,
        <ExpandIcon className={clsx(ICON_CLASSNAME, 'size-3 absolute top-1 right-1.5')} />
    );
}
